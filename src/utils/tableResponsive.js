/**
 * Utilitário avançado para tornar tabelas responsivas com exibição otimizada em todos os dispositivos
 * - Adapta automaticamente para dispositivos móveis, tablets e desktops
 * - Implementa breakpoints customizáveis
 * - Adiciona animações suaves nas transições
 * - Melhora a acessibilidade com atributos ARIA
 */
export function inicializarResponsividadeTabelas(options = {}) {
    // configs padrão que podem ser sobrescritas
    const config = {
        delay: options.delay || 100, // reduz para ser mais rápido
        breakpointMobile: options.breakpointMobile || 576,
        breakpointTablet: options.breakpointTablet || 768,
        animationSpeed: options.animationSpeed || 300,
        ...options
    };

    // funções para interceptar
    const funcoesParaInterceptar = [
        'exibirReceitas',
        'exibirGastos',
        'exibirMetas',
        'filtrarTransacoes',
        'pesquisarItens'
    ];

    // detecta tipo de dispositivo antecipadamente
    const modoVisualizacao = detectarModoVisualizacao(config);
    document.body.setAttribute('data-view-mode', modoVisualizacao);
    
    // aplica classe de estado de carregamento
    document.body.classList.add('responsive-tables-initializing');
    
    // aplica responsividade imediatamente
    adaptarTabelasParaResponsividade(config);
    
    // remove classe de carregamento após aplicar tudo
    setTimeout(() => {
        document.body.classList.remove('responsive-tables-initializing');
    }, 50);

    // configura observador de DOM para detectar novas tabelas
    configurarObservadorDOM(config);

    // intercepta funções que alteram as tabelas
    interceptarFuncoesVisualizacao(funcoesParaInterceptar, config);

    // add listener para redimensionamento da janela
    configurarRedimensionamento(config);
}

/**
 * detecta o modo de visualização com base na largura da tela
 */
function detectarModoVisualizacao(config) {
    const larguraViewport = window.innerWidth;
    return larguraViewport <= config.breakpointMobile ? 'mobile' :
           larguraViewport <= config.breakpointTablet ? 'tablet' : 'desktop';
}

/**
 * configura um observador para detectar quando novas tabelas são adicionadas ao DOM
 */
function configurarObservadorDOM(config) {
    const observer = new MutationObserver((mutations) => {
        let tabelasAdicionadas = false;

        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'TABLE' || node.querySelector('table')) {
                            tabelasAdicionadas = true;
                        }
                    }
                });
            }
        });

        if (tabelasAdicionadas) {
            // processa tabelas imediatamente
            adaptarTabelasParaResponsividade(config);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * intercepta funções de visualização para aplicar responsividade após execução
 */
function interceptarFuncoesVisualizacao(funcoes, config) {
    funcoes.forEach(nomeFuncao => {
        if (window[nomeFuncao]) {
            const funcaoOriginal = window[nomeFuncao];
            window[nomeFuncao] = function () {
                // ativa classe de carregamento
                document.body.classList.add('responsive-tables-updating');
                
                const resultado = funcaoOriginal.apply(this, arguments);

                // adapta imediatamente sem esperar
                adaptarTabelasParaResponsividade(config);
                
                // remove classe de carregamento após um tempo curto
                setTimeout(() => {
                    document.body.classList.remove('responsive-tables-updating');
                }, 50);

                return resultado;
            };
        }
    });
}

/**
 * configura listener para redimensionamento da janela
 */
function configurarRedimensionamento(config) {
    // variável para controlar o último modo visualizado
    let ultimoModoVisualizacao = detectarModoVisualizacao(config);
    
    // usa ResizeObserver para ter melhor performance
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(throttle(() => {
            const novoModo = detectarModoVisualizacao(config);
            
            // só atualiza se o modo mudou
            if (novoModo !== ultimoModoVisualizacao) {
                ultimoModoVisualizacao = novoModo;
                adaptarLayoutResponsivo(config);
            }
        }, 100)); // reduz para 100ms

        resizeObserver.observe(document.body);
    } else {
        // fallback para browsers sem ResizeObserver
        window.addEventListener('resize', throttle(() => {
            const novoModo = detectarModoVisualizacao(config);
            
            // só atualiza se o modo mudou
            if (novoModo !== ultimoModoVisualizacao) {
                ultimoModoVisualizacao = novoModo;
                adaptarLayoutResponsivo(config);
            }
        }, 100)); // reduz para 100ms
    }
}

/**
 * adapta o layout com base no tamanho atual da tela
 */
function adaptarLayoutResponsivo(config) {
    const modoVisualizacao = detectarModoVisualizacao(config);
    document.body.setAttribute('data-view-mode', modoVisualizacao);

    document.querySelectorAll('table.table').forEach(table => {
        table.setAttribute('data-view-mode', modoVisualizacao);
    });
}

/**
 * função principal para adaptar tabelas para layout responsivo
 */
function adaptarTabelasParaResponsividade(config) {
    // aplica classe global para estilização CSS
    document.body.classList.add('responsive-tables-enabled');

    // detecta tamanho de tela inicial
    adaptarLayoutResponsivo(config);

    // processa cada tabela encontrada
    document.querySelectorAll('table.table').forEach(table => {
        // evita reprocessamento se já estiver adaptada
        if (table.hasAttribute('data-responsive-processed')) {
            atualizarTabela(table, config);
            return;
        }

        // define view-mode antes de processar
        const modoVisualizacao = detectarModoVisualizacao(config);
        table.setAttribute('data-view-mode', modoVisualizacao);
        
        // marca como processada
        table.setAttribute('data-responsive-processed', 'true');

        // add wrappers para melhor controle de overflow
        wrapTable(table);

        // identifica tipo de tabela e aplicar tratamento específico
        identificarETratarTabela(table, config);

        // melhora acessibilidade
        melhorarAcessibilidade(table);
    });
}

/**
 * envolve a tabela em um wrapper para melhor controle de scroll
 */
function wrapTable(table) {
    if (table.parentNode.classList.contains('table-responsive-wrapper')) {
        return; // já está envolvida
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive-wrapper';

    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
}

/**
 * atualiza tabelas já processadas (para quando os dados mudam)
 */
function atualizarTabela(table, config) {
    // identifica células que precisam ser atualizadas
    table.querySelectorAll('tbody tr').forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
            const header = table.querySelector(`thead th:nth-child(${index + 1})`);
            if (!header) return;

            const headerText = header.querySelector('.desktop-header-text')?.textContent ||
                header.textContent.trim();

            // add atributo data-label se não existir
            if (!cell.hasAttribute('data-label')) {
                cell.setAttribute('data-label', headerText);
            }
        });
    });

    // atualiza botões e ações se necessário
    atualizarBotoesEAcoes(table);
}

/**
 * identifica o tipo de tabela e aplica tratamento específico
 */
function identificarETratarTabela(table, config) {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

    // determina tipo de tabela
    const tipoTabela = determinarTipoTabela(headers);
    table.setAttribute('data-table-type', tipoTabela);

    // aplica mapeamentos específicos
    const headerMappings = obterMapeamentoCabecalhos(tipoTabela);

    // processa cabeçalhos
    processarCabecalhos(table, headerMappings);

    // processa células de dados
    processarCelulas(table, headerMappings);

    // processa botões de ação
    processarBotoes(table);
}

/**
 * determina o tipo de tabela baseado nos cabeçalhos
 */
function determinarTipoTabela(headers) {
    if (headers.includes('Nome') && headers.includes('Progresso')) {
        return 'metas';
    } else if (headers.includes('Data') && headers.includes('Categoria')) {
        return headers.some(h => h.includes('Receita')) ? 'receitas' : 'gastos';
    } else {
        return 'generica';
    }
}

/**
 * retorna mapeamento de cabeçalhos com base no tipo de tabela
 */
function obterMapeamentoCabecalhos(tipoTabela) {
    const mapeamentoBase = {
        'Descrição': { desktop: 'Descrição', mobile: 'Desc.', tablet: 'Descrição', icon: 'fa-file-alt' },
        'Valor': { desktop: 'Valor', mobile: 'Valor', tablet: 'Valor', icon: 'fa-dollar-sign' },
        'Categoria': { desktop: 'Categoria', mobile: 'Cat.', tablet: 'Categ.', icon: 'fa-tag' },
        'Data': { desktop: 'Data', mobile: 'Data', tablet: 'Data', icon: 'fa-calendar-alt' },
        'Ações': { desktop: 'Ações', mobile: '', tablet: 'Ações', icon: 'fa-cog' }
    };

    const mapeamentoMetas = {
        ...mapeamentoBase,
        'Nome': { desktop: 'Nome', mobile: 'Nome', tablet: 'Nome', icon: 'fa-bullseye' },
        'Estimativa': { desktop: 'Estimativa', mobile: 'Est.', tablet: 'Estimativa', icon: 'fa-clock' },
        'Progresso': { desktop: 'Progresso', mobile: 'Prog.', tablet: 'Progresso', icon: 'fa-chart-line' }
    };

    switch (tipoTabela) {
        case 'metas':
            return mapeamentoMetas;
        case 'receitas':
        case 'gastos':
        default:
            return mapeamentoBase;
    }
}

/**
 * processa os cabeçalhos da tabela
 */
function processarCabecalhos(table, headerMappings) {
    table.querySelectorAll('thead th').forEach(th => {
        const textoOriginal = th.textContent.trim();

        // pula se já processado
        if (th.querySelector('.desktop-header-text')) return;

        const mapeamento = headerMappings[textoOriginal] || {
            desktop: textoOriginal,
            mobile: textoOriginal.substring(0, 4),
            tablet: textoOriginal.length > 6 ? textoOriginal.substring(0, 6) + '.' : textoOriginal,
            icon: 'fa-circle'
        };

        th.innerHTML = `
            <span class="desktop-header-text">${mapeamento.desktop}</span>
            <span class="tablet-header-text" title="${mapeamento.desktop}">
                <i class="fas ${mapeamento.icon} me-1"></i>${mapeamento.tablet}
            </span>
            <span class="mobile-header-text" title="${mapeamento.desktop}">
                <i class="fas ${mapeamento.icon}"></i><span class="sr-only">${mapeamento.desktop}</span>
            </span>
        `;

        // add atributos para acessibilidade
        th.setAttribute('data-original-text', textoOriginal);
    });
}

/**
 * processa as células de dados da tabela
 */
function processarCelulas(table, headerMappings) {
    table.querySelectorAll('tbody tr').forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
            const header = table.querySelector(`thead th:nth-child(${index + 1})`);
            if (!header) return;

            const headerText = header.getAttribute('data-original-text') ||
                header.querySelector('.desktop-header-text')?.textContent ||
                header.textContent.trim();

            // add atributo data-label para CSS responsivo
            cell.setAttribute('data-label', headerText);

            // add classes especiais para formatação
            if (headerText === 'Valor') {
                cell.classList.add('cell-valor');
            } else if (headerText === 'Progresso') {
                cell.classList.add('cell-progresso');
            }
        });
    });
}

/**
 * processa botões de ação para responsividade
 */
function processarBotoes(table) {
    table.querySelectorAll('button.btn-sm, .btn-sm').forEach(btn => {
        // pula se já processado
        if (btn.querySelector('.btn-icon')) return;

        // extrai o texto atual e ícone (se houver)
        const conteudoHTML = btn.innerHTML;
        const textoMatch = conteudoHTML.match(/<i class="fas (fa-[^"]+)"><\/i>\s*([^<]+)/);

        if (textoMatch) {
            const iconeClass = textoMatch[1];
            const texto = textoMatch[2].trim();

            btn.innerHTML = `
                <i class="fas ${iconeClass} btn-icon" aria-hidden="true"></i>
                <span class="btn-text">${texto}</span>
                <span class="sr-only">${texto}</span>
            `;
            btn.classList.add('btn-action');
            btn.setAttribute('title', texto);
        }
    });
}

/**
 * atualiza os botões e ações após mudanças nos dados
 */
function atualizarBotoesEAcoes(table) {
    // garante que novos botões sejam processados
    table.querySelectorAll('button.btn-sm:not(.btn-action), .btn-sm:not(.btn-action)').forEach(btn => {
        // extrai o texto atual e ícone (se houver)
        const conteudoHTML = btn.innerHTML;
        const textoMatch = conteudoHTML.match(/<i class="fas (fa-[^"]+)"><\/i>\s*([^<]+)/);

        if (textoMatch) {
            const iconeClass = textoMatch[1];
            const texto = textoMatch[2].trim();

            btn.innerHTML = `
                <i class="fas ${iconeClass} btn-icon" aria-hidden="true"></i>
                <span class="btn-text">${texto}</span>
                <span class="sr-only">${texto}</span>
            `;
            btn.classList.add('btn-action');
            btn.setAttribute('title', texto);
        }
    });
}

/**
 * melhora acessibilidade da tabela
 */
function melhorarAcessibilidade(table) {
    // add role para tabelas
    table.setAttribute('role', 'table');

    // add aria-labels em botões
    table.querySelectorAll('button').forEach(btn => {
        const texto = btn.textContent.trim();
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', texto);
        }
    });

    // add ID único para a tabela
    if (!table.id) {
        table.id = `tabela-${Math.random().toString(36).substring(2, 9)}`;
    }

    // add caption se não existir
    if (!table.querySelector('caption')) {
        const tipoTabela = table.getAttribute('data-table-type');
        const captionTexto = tipoTabela === 'metas' ? 'Lista de Metas' :
            tipoTabela === 'receitas' ? 'Lista de Receitas' :
                tipoTabela === 'gastos' ? 'Lista de Gastos' : 'Tabela de Dados';

        const caption = document.createElement('caption');
        caption.className = 'visually-hidden';
        caption.textContent = captionTexto;

        table.prepend(caption);
    }
}

/**
 * função helper para throttle (limitar frequência de chamadas)
 */
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * inicializa quando o documento estiver pronto
 */
document.addEventListener('DOMContentLoaded', function () {
    // inicializa imediatamente ao invés de esperar
    inicializarResponsividadeTabelas();
    
    // add estilos CSS necessários para responsividade
    adicionarEstilosCSS();
});

/**
 * add estilos CSS necessários para responsividade
 */
function adicionarEstilosCSS() {
    // verifica se os estilos já foram adicionados
    if (document.getElementById('responsive-tables-styles')) return;

    const estilos = document.createElement('style');
    estilos.id = 'responsive-tables-styles';
    estilos.textContent = `
        /* estilos para tabelas responsivas */
        .table-responsive-wrapper {
            width: 100%;
            overflow-x: auto;
            position: relative;
        }
        
        /* esconder elementos durante inicialização/atualização */
        .responsive-tables-initializing table.table,
        .responsive-tables-updating table.table {
            opacity: 1; /* Mantém visível para evitar flash */
        }
        
        /* modos de visualização */
        table.table[data-view-mode="desktop"] .mobile-header-text,
        table.table[data-view-mode="desktop"] .tablet-header-text {
            display: none !important;
        }
        
        table.table[data-view-mode="tablet"] .mobile-header-text,
        table.table[data-view-mode="tablet"] .desktop-header-text {
            display: none !important;
        }
        
        table.table[data-view-mode="mobile"] .desktop-header-text,
        table.table[data-view-mode="mobile"] .tablet-header-text {
            display: none !important;
        }
        
        /* esconder todas as opções que não são desktop imediatamente */
        .mobile-header-text, .tablet-header-text {
            display: none !important;
        }
        
        /* botões responsivos */
        @media (max-width: 576px) {
            .btn-action .btn-text {
                display: none;
            }
            
            .btn-action {
                padding: 0.25rem 0.5rem;
                min-width: 32px;
                justify-content: center;
            }
        }
        
        @media (max-width: 768px) {
            table.table .cell-valor {
                font-weight: bold;
            }
        }
        
        /* display para dispositivos pequenos */
        @media (max-width: 576px) {
            table.table tbody tr {
                display: block;
                margin-bottom: 1rem;
                border: 1px solid rgba(0,0,0,.125);
                border-radius: 0.25rem;
                padding: 0.5rem;
            }
            
            table.table tbody td {
                display: flex;
                justify-content: space-between;
                text-align: right;
                border: none;
                padding: 0.5rem 0.25rem;
                border-bottom: 1px solid rgba(0,0,0,.05);
            }
            
            table.table tbody td:last-child {
                border-bottom: none;
            }
            
            table.table tbody td::before {
                content: attr(data-label);
                font-weight: bold;
                text-align: left;
                padding-right: 0.5rem;
            }
            
            table.table thead {
                display: none;
            }
        }
        
        /* animations - só aplicar transições após inicialização completa */
        .responsive-tables-enabled:not(.responsive-tables-initializing):not(.responsive-tables-updating) .table-responsive-wrapper {
            transition: all 0.3s ease;
        }
        
        /* acessibilidade */
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;

    document.head.appendChild(estilos);
}