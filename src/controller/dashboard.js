import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// menu user
function setupUserAccountActions() {
    console.log("Configurando ações da conta de usuário");
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Logout button clicked");
            try {
                Auth.logout();
            } catch (error) {
                console.error("Error during logout:", error);
            }
        });
        console.log("Logout button event listener added");
    } else {
        console.error("Logout button not found in the DOM");
    }

    // excluir conta
    const deleteAccountButton = document.getElementById('delete-account-button');
    if (deleteAccountButton) {
        console.log("Delete account button found");
        deleteAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Delete account button clicked");
            showDeleteAccountConfirmation();
        });
    } else {
        console.error("Delete account button not found in the DOM");
    }
}

// mostra confirmação antes de excluir a conta
function showDeleteAccountConfirmation() {
    // usar SweetAlert2 diretamente em vez de criar um modal manualmente
    Swal.fire({
        title: 'Excluir Conta',
        html: `
            <p>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</p>
            <p class="text-danger fw-bold">Todos os seus dados serão permanentemente excluídos:</p>
            <ul class="text-start">
                <li>Gastos</li>
                <li>Receitas</li>
                <li>Metas</li>
            </ul>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-trash me-2"></i>Sim, excluir minha conta',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Excluindo conta...',
                    text: 'Por favor, aguarde enquanto excluímos sua conta.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // deleta conta do usuário
                await deleteUserAccount();
                
                Swal.fire({
                    title: 'Conta Excluída',
                    text: 'Sua conta foi excluída com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = 'login.html';
                });
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Ocorreu um erro ao excluir sua conta: ' + (error.message || 'Tente novamente mais tarde'),
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

// fecha modal de confirmação
function closeDeleteModal(modal) {
    document.body.removeChild(modal);
    document.body.classList.remove('modal-open');
}

// exclui conta do usuário com cascata
async function deleteUserAccount() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.uid) {
        throw new Error('Usuário não encontrado');
    }

    try {
        console.log("Iniciando processo de exclusão de conta");

        const userId = user.uid;
        const userEmail = user.email;

        console.log("Excluindo usuário do Firebase Authentication");
        await Auth.deleteUserAccount();

        console.log("Excluindo dados do Firestore");
        await FirestoreService.deleteUserData(userId);

        console.log("Limpando dados do localStorage");
        cleanupLocalStorage(userEmail);

        console.log("Exclusão de conta completa");
        return true;
    } catch (error) {
        console.error("Erro completo na exclusão da conta:", error);
        throw error;
    }
}

// clean no localStorage
function cleanupLocalStorage(userEmail) {
    if (!userEmail) return;

    const prefixes = ['gastos_', 'receitas_', 'metas_', 'configuracoes_'];

    prefixes.forEach(prefix => {
        localStorage.removeItem(`${prefix}${userEmail}`);
    });

    localStorage.removeItem('loggedInUser');
}

// formata valores monetários, permitindo exibição abreviada com tooltip para valores completos
function formatarMoeda(valor, formatoCompleto = false) {
    // formato completo para exibição no tooltip
    const valorCompleto = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // se quisermos o formato completo, retornamos diretamente
    if (formatoCompleto) {
        return valorCompleto;
    }

    // formato abreviado para valores grandes
    const abs = Math.abs(valor);
    let valorAbreviado;

    if (abs >= 1000000) {
        // valores em milhões (M) - três casas decimais para maior precisão
        valorAbreviado = 'R$ ' + (valor / 1000000).toFixed(3).replace('.', ',') + 'M';
    } else if (abs >= 10000) {
        // valores entre 10 mil e 1 milhão - duas casas decimais para maior precisão
        valorAbreviado = 'R$ ' + (valor / 1000).toFixed(2).replace('.', ',') + 'K';
    } else if (abs >= 1000) {
        // valores entre 1000 e 10000 - três casas decimais para alta precisão
        valorAbreviado = 'R$ ' + (valor / 1000).toFixed(3).replace('.', ',') + 'K';
    } else {
        // valores menores, formato padrão sem abreviação
        valorAbreviado = valorCompleto;
    }

    // remove zeros desnecessários no final das casas decimais
    valorAbreviado = valorAbreviado.replace(/,0+([KM])/g, '$1');

    // se terminar com um só zero na casa decimal (ex: 3,20K), remove-o
    valorAbreviado = valorAbreviado.replace(/,(\d)0([KM])/g, ',$1$2');

    return {
        abreviado: valorAbreviado,
        completo: valorCompleto
    };
}

// calcula totais
function calcularTotais() {
    const { gastos, receitas } = obterDados();

    const totalGastos = gastos.reduce((total, gasto) => total + parseFloat(gasto.valor), 0);
    const totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    const saldo = totalReceitas - totalGastos;

    // atualiza elementos HTML com tooltip
    atualizarElementoComTooltip('totalGastos', totalGastos);
    atualizarElementoComTooltip('totalReceitas', totalReceitas);
    atualizarElementoComTooltip('saldoTotal', saldo);

    return { totalGastos, totalReceitas, saldo };
}

// função auxiliar para atualizar elemento com tooltip
function atualizarElementoComTooltip(elementId, valor) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;

    const formatado = formatarMoeda(valor);

    // adiciona atributos de dados e classes para tooltip
    elemento.textContent = formatado.abreviado;
    elemento.setAttribute('data-bs-toggle', 'tooltip');
    elemento.setAttribute('data-bs-placement', 'top');
    elemento.setAttribute('title', formatado.completo);
    elemento.classList.add('valor-monetario');
}

// configura tooltips personalizados que funcionam em desktop e mobile
function configurarTitulos() {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(element => {
        const instance = bootstrap.Tooltip.getInstance(element);
        if (instance) {
            instance.dispose();
        }

        const title = element.getAttribute('title') || element.getAttribute('data-bs-original-title');
        element.removeAttribute('data-bs-toggle');
        element.removeAttribute('data-bs-placement');
        element.removeAttribute('data-bs-original-title');

        if (title) {
            element.setAttribute('title', title);

            // add um atributo personalizado para armazenar o título para uso móvel
            element.setAttribute('data-custom-tooltip', title);

            // add classe para estilização
            element.classList.add('has-tooltip');

            // add eventos para desktop (mouseover/mouseleave)
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);

            // add evento de toque específico para dispositivos móveis
            element.addEventListener('touchstart', function (e) {
                e.preventDefault(); // previne o comportamento padrão
                e.stopPropagation(); // evita propagação

                showTooltip.call(this, e);

                // define um timer para fechar após um período
                setTimeout(() => {
                    hideAllTooltips();
                }, 3000); // fecha após 3 segundos
            }, { passive: false });
        }
    });

    // add estilos para os tooltips personalizados
    if (!document.getElementById('tooltip-style')) {
        const style = document.createElement('style');
        style.id = 'tooltip-style';
        style.textContent = `
            .has-tooltip {
                position: relative;
                cursor: pointer;
            }
            
            .custom-tooltip {
                position: fixed;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 9999;
                max-width: 300px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                pointer-events: none;
                animation: fadeIn 0.2s ease-in;
            }
            
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            .custom-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
            }
            
            /* Estilo específico para dispositivos móveis */
            @media (max-width: 768px) {
                .custom-tooltip {
                    padding: 8px 12px;
                    font-size: 16px; /* Texto maior em dispositivos móveis */
                }
            }
        `;
        document.head.appendChild(style);
    }

    // evento global para fechar tooltips quando rolar a página
    window.addEventListener('scroll', hideAllTooltips, { passive: true });

    // evento global para fechar tooltips ao clicar fora em dispositivos móveis
    document.addEventListener('touchstart', function (e) {
        // se o clique não foi em um elemento com tooltip
        if (!e.target.classList.contains('has-tooltip')) {
            hideAllTooltips();
        }
    }, { passive: true });

    // add evento de clique global para desktop
    document.addEventListener('click', function (e) {
        // se o clique não foi em um elemento com tooltip
        if (!e.target.classList.contains('has-tooltip')) {
            hideAllTooltips();
        }
    });
}

// mostra tooltip
function showTooltip(e) {
    // remove qualquer tooltip personalizado existente primeiro
    hideAllTooltips();

    // cria o tooltip personalizado
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = this.getAttribute('data-custom-tooltip');

    // posiciona o tooltip perto do elemento
    const rect = this.getBoundingClientRect();
    document.body.appendChild(tooltip);

    // centraliza o tooltip sobre o elemento
    const tooltipRect = tooltip.getBoundingClientRect();

    // verificação para não ultrapassar os limites da tela
    let leftPos = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    leftPos = Math.max(10, Math.min(leftPos, window.innerWidth - tooltipRect.width - 10)); // mantém dentro da tela

    tooltip.style.left = `${leftPos}px`;
    tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;

    // marca este elemento como tendo um tooltip ativo
    this.dataset.tooltipActive = 'true';
}

// esconde um tooltip específico
function hideTooltip() {
    if (this.dataset.tooltipActive === 'true') {
        this.dataset.tooltipActive = 'false';
        hideAllTooltips();
    }
}

// esconde todos os tooltips
function hideAllTooltips() {
    document.querySelectorAll('.custom-tooltip').forEach(t => t.remove());
    document.querySelectorAll('[data-tooltip-active="true"]').forEach(el => {
        el.dataset.tooltipActive = 'false';
    });
}

// detecta se o dispositivo é móvel para comportamento específico
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Função para atualizar as informações do usuário no menu
function atualizarDadosUsuarioNoMenu() {
    try {
        const user = Auth.getLoggedInUser();
        
        if (!user) {
            console.warn("Usuário não encontrado no localStorage");
            return;
        }
        
        // Atualiza o nome do usuário na barra de navegação
        const userMenuName = document.querySelector('#userMenu span.d-none.d-md-inline');
        if (userMenuName) {
            userMenuName.textContent = user.name || 'Usuário';
        }
        
        // Atualiza avatar com as iniciais do usuário real
        const userInitials = user.name ? encodeURIComponent(user.name) : 'Usuario';
        const avatarUrls = document.querySelectorAll('.user-avatar');
        avatarUrls.forEach(avatar => {
            avatar.src = `https://ui-avatars.com/api/?name=${userInitials}&background=4e73df&color=fff&rounded=true${avatar.width >= 64 ? '&size=64' : ''}`;
            avatar.alt = `Avatar de ${user.name || 'Usuário'}`;
        });
        
        // Atualiza informações no dropdown
        const userNameElement = document.querySelector('.user-info .user-name');
        if (userNameElement) {
            userNameElement.textContent = user.name || 'Usuário';
        }
        
        const userEmailElement = document.querySelector('.user-info .user-email');
        if (userEmailElement) {
            userEmailElement.textContent = user.email || 'usuario@email.com';
        }
        
        console.log("Informações do usuário atualizadas no menu");
    } catch (error) {
        console.error("Erro ao atualizar informações do usuário:", error);
    }
}

// add isso à inicialização do seu documento
document.addEventListener('DOMContentLoaded', () => {
    // configura botões de gerenciamento de conta
    setupUserAccountActions();
    
    // Atualiza informações do usuário no menu
    atualizarDadosUsuarioNoMenu();

    // configura a atualização automática
    configurarAtualizacaoAutomatica();

    // inicializa o dashboard
    atualizarDashboard();

    // inicializa tooltips
    configurarTitulos();

    // atualiza a cada minuto para garantir dados atualizados e reinicializa tooltips
    setInterval(() => {
        atualizarDashboard();
        configurarTitulos();
    }, 60000);

    // adiciona observer para inicializar tooltips em elementos adicionados dinamicamente
    const observer = new MutationObserver(function () {
        configurarTitulos();
    });

    // observa mudanças no corpo do documento
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // add listener específico para facilitar fechamento em dispositivos móveis
    if (isMobileDevice()) {
        // toque em qualquer lugar fecha tooltips em dispositivos móveis
        document.addEventListener('touchend', function () {
            setTimeout(hideAllTooltips, 100);
        }, { passive: true });
    }
});

// obtém dados do localStorage
function obterDados() {
    const user = Auth.getLoggedInUser();
    const gastos = JSON.parse(localStorage.getItem(`gastos_${user.email}`)) || [];
    const receitas = JSON.parse(localStorage.getItem(`receitas_${user.email}`)) || [];
    return { gastos, receitas };
}

// carrega metas do localStorage
function carregarMetas() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.email) {
        console.error('Usuário não encontrado ou sem email');
        return [];
    }

    const metasStorage = localStorage.getItem(`metas_${user.email}`);
    if (metasStorage) {
        try {
            return JSON.parse(metasStorage);
        } catch (erro) {
            console.error('Erro ao carregar metas:', erro);
            return [];
        }
    }
    return [];
}

// exibe as metas no dashboard com tooltips para valores monetários
function exibirMetasNoDashboard() {
    const metas = carregarMetas();
    const container = document.getElementById('metas-container');
    const placeholder = document.getElementById('metas-placeholder');

    if (!container) return;

    // limpa o container atual
    container.innerHTML = '';

    // se não há metas
    if (metas.length === 0) {
        if (placeholder) placeholder.style.display = 'block';
        return;
    } else {
        if (placeholder) placeholder.style.display = 'none';
    }

    // calcula o saldo mensal para estimativas
    const { totalReceitas, totalGastos } = calcularTotais();
    const saldoMensal = totalReceitas - totalGastos;

    // exibe apenas as 3 metas mais recentes
    const metasRecentes = metas.slice(0, 3);

    metasRecentes.forEach(meta => {
        const card = document.createElement('div');
        card.className = 'card mb-2 border-0 bg-light';

        // calcula estimativa
        let textoEstimativa = 'Calcular estimativa';
        let classeEstimativa = 'text-muted';

        if (saldoMensal > 0) {
            const mesesNecessarios = meta.valor / saldoMensal;

            if (mesesNecessarios < 1) {
                textoEstimativa = 'Menos de 1 mês';
                classeEstimativa = 'text-success';
            } else if (mesesNecessarios < 12) {
                const meses = Math.ceil(mesesNecessarios);
                textoEstimativa = `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
                classeEstimativa = 'text-primary';
            } else {
                const anos = Math.floor(mesesNecessarios / 12);
                const mesesRestantes = Math.ceil(mesesNecessarios % 12);

                textoEstimativa = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
                if (mesesRestantes > 0) {
                    textoEstimativa += ` e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
                }
                classeEstimativa = mesesNecessarios > 60 ? 'text-danger' : 'text-warning';
            }
        } else {
            textoEstimativa = 'Saldo insuficiente';
            classeEstimativa = 'text-danger';
        }

        // calcula a porcentagem de progresso
        const porcentagemMensal = saldoMensal > 0 ? (saldoMensal / meta.valor) * 100 : 0;
        const porcentagemProgress = Math.min(100, porcentagemMensal);

        // determina a classe de cor para a barra de progresso
        let progressClass = 'progress-bar';
        if (porcentagemMensal < 5) {
            progressClass += ' bg-danger';
        } else if (porcentagemMensal < 10) {
            progressClass += ' bg-warning';
        } else if (porcentagemMensal < 20) {
            progressClass += ' bg-info';
        } else {
            progressClass += ' bg-success';
        }

        // formata o valor com tooltip
        const valorFormatado = formatarMoeda(parseFloat(meta.valor));

        card.innerHTML = `
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="card-title mb-0">${meta.nome}</h6>
                    <span class="badge bg-primary valor-monetario" 
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top" 
                          title="${valorFormatado.completo}">${valorFormatado.abreviado}</span>
                </div>
                <p class="card-text small text-muted mb-1">${meta.descricao || 'Sem descrição'}</p>
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                        <div class="${progressClass}" role="progressbar" 
                             style="width: ${porcentagemProgress}%;" 
                             aria-valuenow="${porcentagemProgress}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <small class="${classeEstimativa}">${textoEstimativa}</small>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // se há mais metas do que as exibidas
    if (metas.length > 3) {
        const maisMetasText = document.createElement('p');
        maisMetasText.className = 'text-center small text-muted mt-2';
        maisMetasText.textContent = `+ ${metas.length - 3} outras metas`;
        container.appendChild(maisMetasText);
    }
}

// agrupa dados por mês
function agruparPorMes(dados) {
    const hoje = new Date();
    const futuro = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate()); // data limite: um ano no futuro
    const ultimosMeses = {};

    // inicializar os últimos 6 meses com zero
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        ultimosMeses[chave] = 0;
    }

    // somar valores por mês, incluindo dados futuros (até um ano)
    dados.forEach(item => {
        const data = new Date(item.data);

        // verifica se a data está dentro do intervalo permitido (até um ano no futuro)
        if (data <= futuro) {
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

            // se a chave já existe no objeto ultimosMeses, adicione o valor
            if (chave in ultimosMeses) {
                ultimosMeses[chave] += parseFloat(item.valor);
            }
            // caso contrário, se for uma data futura (dentro do próximo ano), crie a chave
            else if (data > hoje && data <= futuro) {
                ultimosMeses[chave] = parseFloat(item.valor);
            }
        }
    });

    return Object.values(ultimosMeses);
}

// agrupa gastos por categoria
function agruparGastosPorCategoria(gastos) {
    const categorias = {};
    const hoje = new Date();
    const futuro = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate()); // Data limite: um ano no futuro

    gastos.forEach(gasto => {
        const data = new Date(gasto.data);

        // verifica se a data do gasto está dentro do intervalo permitido (até um ano no futuro)
        if (data <= futuro) {
            if (!categorias[gasto.categoria]) {
                categorias[gasto.categoria] = 0;
            }
            categorias[gasto.categoria] += parseFloat(gasto.valor);
        }
    });

    return categorias;
}

// gera cores aleatórias
function gerarCores(quantidade) {
    const cores = [];
    for (let i = 0; i < quantidade; i++) {
        const cor = `hsl(${(i * 360) / quantidade}, 70%, 50%)`;
        cores.push(cor);
    }
    return cores;
}

// variáveis para armazenar as instâncias dos gráficos
let gastosReceitasChart = null;
let gastosPorCategoriaChart = null;

// cria ou atualiza o gráfico de barras (Gastos vs Receitas)
function criarGraficoGastosReceitas() {
    const { gastos, receitas } = obterDados();
    const gastosporMes = agruparPorMes(gastos);
    const receitasporMes = agruparPorMes(receitas);

    const ctx = document.getElementById('gastosReceitasChart').getContext('2d');

    // gera labels para os últimos 6 meses
    const labels = [];
    const hoje = new Date();

    // últimos 5 meses mais o mês atual
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(data.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }));
    }

    // destrói o gráfico existente se houver
    if (gastosReceitasChart) {
        gastosReceitasChart.destroy();
    }

    gastosReceitasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasporMes,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos',
                    data: gastosporMes,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatarMoeda(value).abreviado;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const valorFormatado = formatarMoeda(context.raw, true);
                            return `${context.dataset.label}: ${valorFormatado}`;
                        }
                    }
                }
            }
        }
    });
}

// cria ou atualiza o gráfico de pizza (distribuição de gastos)
function criarGraficoGastosPorCategoria() {
    const { gastos } = obterDados();
    const gastosPorCategoria = agruparGastosPorCategoria(gastos);

    const categorias = Object.keys(gastosPorCategoria);
    const valores = Object.values(gastosPorCategoria);
    const cores = gerarCores(categorias.length);

    const ctx = document.getElementById('gastosPorCategoriaChart').getContext('2d');

    // destrói o gráfico existente se houver
    if (gastosPorCategoriaChart) {
        gastosPorCategoriaChart.destroy();
    }

    gastosPorCategoriaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categorias,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const valorFormatado = formatarMoeda(context.raw, true);
                            const categoria = context.label;
                            return `${categoria}: ${valorFormatado}`;
                        }
                    }
                }
            }
        }
    });
}

// atualiza todos os dados do dashboard
function atualizarDashboard() {
    calcularTotais();
    criarGraficoGastosReceitas();
    criarGraficoGastosPorCategoria();
    exibirMetasNoDashboard();
}

// cria um evento personalizado de atualização
function configurarAtualizacaoAutomatica() {
    // substitui o getItem e setItem padrão do localStorage para interceptar mudanças
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        // chama o método original
        originalSetItem.call(this, key, value);

        // verifica se a chave é relacionada a gastos ou receitas ou metas
        const user = Auth.getLoggedInUser();
        if (user && (key === `gastos_${user.email}` || key === `receitas_${user.email}` || key === `metas_${user.email}`)) {
            atualizarDashboard();
        }
    };

    // verifica por mudanças de outras abas também
    window.addEventListener('storage', (event) => {
        const user = Auth.getLoggedInUser();
        if (user && (event.key === `gastos_${user.email}` || event.key === `receitas_${user.email}` || event.key === `metas_${user.email}`)) {
            atualizarDashboard();
        }
    });
}

// modificação no evento DOMContentLoaded para inicializar tooltips
document.addEventListener('DOMContentLoaded', () => {
    // configura botões de gerenciamento de conta
    setupUserAccountActions();
    
    // Atualiza informações do usuário no menu
    atualizarDadosUsuarioNoMenu();

    // configura a atualização automática
    configurarAtualizacaoAutomatica();

    // inicializa o dashboard
    atualizarDashboard();

    // inicializa tooltips
    configurarTitulos();

    // atualiza a cada minuto para garantir dados atualizados e reinicializa tooltips
    setInterval(() => {
        atualizarDashboard();
        configurarTitulos();
    }, 60000);

    // adiciona observer para inicializar tooltips em elementos adicionados dinamicamente
    const observer = new MutationObserver(function () {
        configurarTitulos();
    });

    // observa mudanças no corpo do documento
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});