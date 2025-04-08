import { Meta } from "../model/Meta.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
import { inicializarResponsividadeTabelas } from '../utils/tableResponsive.js';

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// função aprimorada para garantir que uma data seja válida
function garantirDataValida(data) {
    // se não receber um valor, retornar a data atual
    if (!data) return new Date();

    try {
        // se for string de data ISO, converter para Date
        if (typeof data === 'string') {
            const d = new Date(data);
            if (!isNaN(d.getTime())) {
                return d;
            }
        }

        // se for timestamp do Firebase
        if (data && typeof data === 'object' && data.toDate) {
            try {
                return data.toDate();
            } catch (e) {
                return new Date();
            }
        }

        // se já for um objeto Date válido
        if (data instanceof Date && !isNaN(data.getTime())) {
            return data;
        }

        // testa uma estrutura possível data.seconds do Firestore
        if (data && typeof data === 'object' && 'seconds' in data) {
            try {
                return new Date(data.seconds * 1000);
            } catch (e) {
                return new Date();
            }
        }
    } catch (e) {
        console.warn("Erro ao processar data:", e);
    }

    // fallback para data atual em caso de qualquer erro
    return new Date();
}

// array para armazenar as metas
let metas = [];

// variáveis para armazenar dados financeiros
let saldoMensal = 0;
let receitasMensais = 0;
let gastosMensais = 0;

// variáveis para filtros
let filtros = {
    texto: '',
    valorMaximo: null
};

// carrega metas do localStorage e Firestore
async function carregarDados() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.email) {
        console.error('Usuário não encontrado ou sem email');
        return;
    }

    // carrega dados financeiros PRIMEIRO para atualizar saldoMensal
    carregarDadosFinanceirosLocais(user.email);

    // carrega imediatamente do localStorage
    carregarLocalStorage(user.email);

    // renderiza UI com dados do localStorage
    exibirMetas();
    calcularEstimativas();

    // inicializa coleções e atualizar do Firestore em segundo plano
    setTimeout(async () => {
        await FirestoreService.inicializarColecoes();
        await atualizarDoFirestore();
    }, 0);

    return true;
}

// carrega metas do localStorage
function carregarLocalStorage(userEmail) {
    const metasLocalStorage = localStorage.getItem(`metas_${userEmail}`);
    if (metasLocalStorage) {
        metas = JSON.parse(metasLocalStorage);

        // garante que todas as metas tenham datas
        const agora = new Date();
        metas.forEach(meta => {
            if (!meta.dataCriacao) {
                meta.dataCriacao = agora;
            }
            if (!meta.ultimaAtualizacao) {
                meta.ultimaAtualizacao = agora;
            }
        });

        // salva as metas atualizadas
        salvarDados();
    } else {
        metas = [];
    }
}

// carrega os dados financeiros do localStorage
function carregarDadosFinanceirosLocais(userEmail) {
    console.log("Carregando dados financeiros para cálculo de saldo mensal");

    // carrega receitas
    const receitasStorage = localStorage.getItem(`receitas_${userEmail}`);
    if (receitasStorage) {
        try {
            const receitas = JSON.parse(receitasStorage);
            receitasMensais = calcularMediaMensal(receitas);
            console.log(`Receitas mensais calculadas: ${receitasMensais}`);
        } catch (erro) {
            console.error('Erro ao carregar receitas:', erro);
            receitasMensais = 0;
        }
    }

    // carrega gastos
    const gastosStorage = localStorage.getItem(`gastos_${userEmail}`);
    if (gastosStorage) {
        try {
            const gastos = JSON.parse(gastosStorage);
            gastosMensais = calcularMediaMensal(gastos);
            console.log(`Gastos mensais calculados: ${gastosMensais}`);
        } catch (erro) {
            console.error('Erro ao carregar gastos:', erro);
            gastosMensais = 0;
        }
    }

    // calcula saldo mensal
    saldoMensal = receitasMensais - gastosMensais;
    console.log(`Saldo mensal calculado: ${saldoMensal}`);

    // atualiza o display imediatamente
    atualizarSaldoMensal();
}

// função para atualizar dados do Firestore em segundo plano
async function atualizarDoFirestore() {
    try {
        const metasData = await FirestoreService.getMetas();
        if (metasData && metasData.length > 0) {
            const novasMetas = metasData.map(data => {
                try {
                    const meta = new Meta(
                        data.nome,
                        data.descricao,
                        parseFloat(data.valor),
                        new Date(data.dataCriacao)
                    );
                    meta.id = data.id;
                    return meta;
                } catch (erro) {
                    console.error('Erro ao processar meta do Firestore:', erro);
                    return null;
                }
            }).filter(meta => meta !== null);

            // verifica se há mudanças antes de atualizar a UI
            if (JSON.stringify(novasMetas) !== JSON.stringify(metas)) {
                metas = novasMetas;
                salvarDados();

                // atualiza UI apenas se houver mudanças
                exibirMetas();
                calcularEstimativas();
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar metas do Firestore:', erro);
    }
}

// calcula a média mensal de receitas ou gastos
function calcularMediaMensal(items) {
    if (!items || items.length === 0) return 0;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // filtra itens do mês atual
    const itensMesAtual = items.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem.getMonth() === mesAtual && dataItem.getFullYear() === anoAtual;
    });

    // soma valores
    const total = itensMesAtual.reduce((soma, item) => soma + parseFloat(item.valor), 0);

    return total;
}

// atualiza o elemento de interface com o saldo mensal
function atualizarSaldoMensal() {
    const saldoValorElement = document.getElementById('saldo-valor');
    const saldoBadgeElement = document.getElementById('saldo-badge');

    if (saldoValorElement) {
        saldoValorElement.textContent = `R$ ${saldoMensal.toFixed(2)}`;

        if (saldoBadgeElement) {
            if (saldoMensal > 0) {
                saldoBadgeElement.textContent = 'Positivo';
                saldoBadgeElement.className = 'badge bg-success ms-2';
                saldoValorElement.className = 'fs-4 text-success';
            } else if (saldoMensal < 0) {
                saldoBadgeElement.textContent = 'Negativo';
                saldoBadgeElement.className = 'badge bg-danger ms-2';
                saldoValorElement.className = 'fs-4 text-danger';
            } else {
                saldoBadgeElement.textContent = 'Neutro';
                saldoBadgeElement.className = 'badge bg-warning ms-2';
                saldoValorElement.className = 'fs-4 text-warning';
            }
        }
    }
}

// calcula e exibir estimativas para as metas
function calcularEstimativas() {
    // garante que o saldo mensal esteja atualizado visualmente
    atualizarSaldoMensal();

    const container = document.getElementById('estimativas-container');
    const placeholder = document.getElementById('estimativas-placeholder');

    // verifica se os elementos existem antes de prosseguir
    if (!container) {
        console.error('Elemento estimativas-container não encontrado');
        return;
    }

    // limpa container atual
    container.innerHTML = '';

    // se não há metas ou saldo mensal é zero ou negativo
    if (metas.length === 0) {
        // verifica se o placeholder existe antes de modificar sua propriedade style
        if (placeholder) {
            placeholder.style.display = 'block';
        } else {
            // se não existir, criar um placeholder alternativo
            const noGoalsMessage = document.createElement('div');
            noGoalsMessage.className = 'alert alert-info';
            noGoalsMessage.textContent = 'Nenhuma meta adicionada ainda.';
            container.appendChild(noGoalsMessage);
        }
        return;
    } else if (placeholder) {
        placeholder.style.display = 'none';
    }

    // se o saldo mensal for zero ou negativo, mostrar um alerta
    if (saldoMensal <= 0) {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-warning';
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Atenção:</strong> Seu saldo mensal é ${saldoMensal < 0 ? 'negativo' : 'zero'}, 
            o que torna impossível estimar quanto tempo levará para atingir suas metas. 
            Considere aumentar suas receitas ou reduzir seus gastos.
        `;
        container.appendChild(alertElement);
        return;
    }

    // cria uma tabela para as estimativas
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Meta</th>
                <th>Valor</th>
                <th>Estimativa</th>
                <th>Progresso</th>
            </tr>
        </thead>
        <tbody id="estimativas-body">
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    // add cada meta à tabela
    metas.forEach(meta => {
        const tr = document.createElement('tr');

        // calcula meses necessários
        const mesesNecessarios = meta.valor / saldoMensal;
        let textoEstimativa;
        let classeEstimativa;

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

        // calcula a porcentagem de progresso com base na proporção do saldo mensal para o valor total
        const porcentagemMensal = (saldoMensal / meta.valor) * 100;
        const porcentagemProgress = Math.min(100, porcentagemMensal); // limita a 100%

        // determina a classe de cor para a barra de progresso
        let progressClass = 'progress-bar-striped';
        if (porcentagemMensal < 5) {
            progressClass += ' bg-danger';
        } else if (porcentagemMensal < 10) {
            progressClass += ' bg-warning';
        } else if (porcentagemMensal < 20) {
            progressClass += ' bg-info';
        } else {
            progressClass += ' bg-success';
        }

        tr.innerHTML = `
            <td>${meta.nome}</td>
            <td>R$ ${meta.valor.toFixed(2)}</td>
            <td class="${classeEstimativa}"><strong>${textoEstimativa}</strong></td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${progressClass}" role="progressbar" 
                         style="width: ${porcentagemProgress}%;" 
                         aria-valuenow="${porcentagemProgress}" aria-valuemin="0" aria-valuemax="100">
                        ${porcentagemMensal.toFixed(1)}% por mês
                    </div>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    container.appendChild(table);

    // responsividade da tabela
    inicializarResponsividadeTabelas();
}

// salva metas no localStorage e inclui ID do Firestore
function salvarDados() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.email) {
        console.error('Erro ao salvar metas: usuário não encontrado ou sem email');
        return;
    }

    // Inclui os IDs do Firestore ao salvar no localStorage
    const metasData = metas.map(meta => {
        try {
            const metaObj = {
                nome: meta.nome,
                descricao: meta.descricao,
                valor: meta.valor
            };

            // tratamento seguro para datas
            try {
                const dataCriacao = garantirDataValida(meta.dataCriacao);
                metaObj.dataCriacao = dataCriacao.toISOString();
            } catch (e) {
                metaObj.dataCriacao = new Date().toISOString();
            }

            try {
                const ultimaAtualizacao = garantirDataValida(meta.ultimaAtualizacao);
                metaObj.ultimaAtualizacao = ultimaAtualizacao.toISOString();
            } catch (e) {
                metaObj.ultimaAtualizacao = new Date().toISOString();
            }

            // add ID se existir (para sincronização com Firestore)
            if (meta.id) {
                metaObj.id = meta.id;
            }

            return metaObj;
        } catch (e) {
            console.error("Erro ao processar meta para salvar:", e);
            // retorna uma meta minimamente válida
            return {
                nome: meta.nome || 'Meta sem nome',
                descricao: meta.descricao || '',
                valor: parseFloat(meta.valor) || 0,
                dataCriacao: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString(),
                id: meta.id
            };
        }
    });

    localStorage.setItem(`metas_${user.email}`, JSON.stringify(metasData));
}

// exibe as metas na lista
function exibirMetas() {
    const listaMetas = document.getElementById('goalsList');
    if (!listaMetas) return;

    listaMetas.innerHTML = '';

    // aplica filtros
    let metasFiltradas = metas;

    // filtra por texto (nome ou descrição)
    if (filtros.texto) {
        const termoFiltro = filtros.texto.toLowerCase().trim();
        metasFiltradas = metasFiltradas.filter(meta =>
            meta.nome.toLowerCase().includes(termoFiltro) ||
            (meta.descricao && meta.descricao.toLowerCase().includes(termoFiltro))
        );
    }

    // filtra por valor máximo
    if (filtros.valorMaximo) {
        metasFiltradas = metasFiltradas.filter(meta =>
            parseFloat(meta.valor) <= filtros.valorMaximo
        );
    }

    if (metasFiltradas.length === 0) {
        if (temFiltrosAtivos()) {
            listaMetas.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-filter me-2"></i>
                    Nenhuma meta encontrada para os filtros aplicados.
                    <button class="btn btn-link p-0 ms-2" onclick="window.limparTodosFiltros()">Limpar filtros</button>
                </div>
            `;
        } else {
            listaMetas.innerHTML = '<div class="alert alert-info">Nenhuma meta adicionada ainda.</div>';
        }
        return;
    }

    // mostra indicador de filtros ativos
    if (temFiltrosAtivos()) {
        const filtroInfo = document.createElement('div');
        filtroInfo.className = 'alert alert-info mb-3';
        filtroInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-filter me-2"></i>
                    <strong>${metasFiltradas.length}</strong> ${metasFiltradas.length === 1 ? 'meta encontrada' : 'metas encontradas'} 
                    para os filtros aplicados.
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="window.limparTodosFiltros()">
                    Limpar filtros
                </button>
            </div>
        `;
        listaMetas.appendChild(filtroInfo);
    }

    // cria tabela para exibir as metas
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    // ordena por valor (maior para menor)
    const metasOrdenadas = [...metasFiltradas].sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor));

    metasOrdenadas.forEach((meta, index) => {
        const tr = document.createElement('tr');

        // formata datas para exibição
        const dataCriacao = meta.dataCriacao ? garantirDataValida(meta.dataCriacao).toLocaleDateString() : 'Não disponível';
        const ultimaAtualizacao = meta.ultimaAtualizacao ? garantirDataValida(meta.ultimaAtualizacao).toLocaleDateString() : 'Não disponível';

        // add tooltip com informações adicionais
        const tooltipInfo = `Criada em: ${dataCriacao}\nÚltima atualização: ${ultimaAtualizacao}`;

        tr.innerHTML = `
            <td title="${tooltipInfo}">${meta.nome}</td>
            <td>${meta.descricao || '-'}</td>
            <td>R$ ${parseFloat(meta.valor).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="window.abrirModalEdicao(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="window.excluirMeta(${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    listaMetas.appendChild(table);

    // add esta linha para aplicar responsividade às tabelas
    inicializarResponsividadeTabelas();
}

// verifica se há filtros ativos
function temFiltrosAtivos() {
    return filtros.texto !== '' || filtros.valorMaximo !== null;
}

// add uma nova meta
async function adicionarMeta(evento) {
    evento.preventDefault();

    try {
        const user = Auth.getLoggedInUser();
        if (!user || !user.email) {
            throw new Error('Você precisa estar logado para adicionar metas.');
        }

        // obtém valores do formulário
        const nome = document.getElementById('name').value;
        const descricao = document.getElementById('description').value;
        const valor = parseFloat(document.getElementById('amount').value);

        // valida os dados
        if (!nome) throw new Error('Nome da meta é obrigatório.');
        if (isNaN(valor) || valor <= 0) throw new Error('Valor da meta deve ser um número positivo.');

        // cria objeto meta
        const meta = {
            nome: nome,
            descricao: descricao,
            valor: valor,
            dataCriacao: new Date(), // add data de criação
            ultimaAtualizacao: new Date() // add data de última atualização
        };

        // salva no Firestore
        try {
            const user = Auth.getLoggedInUser();
            if (!user || !user.email) throw new Error('Usuário não autenticado.');

            // add ao Firestore
            const metaRef = await FirestoreService.addMeta(meta);
            meta.id = metaRef.id;

            // add ao array local
            metas.push(meta);

            // salva no localStorage
            salvarDados();

            // clear no formulário
            document.getElementById('name').value = '';
            document.getElementById('description').value = '';
            document.getElementById('amount').value = '';

            // exibe mensagem de sucesso
            Swal.fire({
                title: 'Sucesso!',
                text: 'Meta adicionada com sucesso.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // atualiza a exibição
            exibirMetas();
            calcularEstimativas();

        } catch (err) {
            console.error("Erro ao adicionar meta ao Firestore:", err);
            throw new Error(`Erro ao salvar meta: ${err.message}`);
        }
    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: erro.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// refs. ao modal
const modalEdicao = document.getElementById('editModal');
const inputNomeEdicao = document.getElementById('editName');
const inputDescricaoEdicao = document.getElementById('editDescription');
const inputValorEdicao = document.getElementById('editAmount');
const formularioEdicaoMeta = document.getElementById('editGoalForm');

let indiceMetaAtual = -1;

// abre o modal de edição
function abrirModalEdicao(indice) {
    indiceMetaAtual = indice;
    const meta = metas[indice];

    inputNomeEdicao.value = meta.nome;
    inputDescricaoEdicao.value = meta.descricao;
    inputValorEdicao.value = meta.valor;

    modalEdicao.style.display = "block";
}

// fecha o modal
function fecharModalEdicao() {
    modalEdicao.style.display = "none";
}

// salva as alterações da meta
async function salvarEdicaoMeta(evento) {
    evento.preventDefault();

    try {
        // obtém valores do formulário
        const nome = document.getElementById('editName').value;
        const descricao = document.getElementById('editDescription').value;
        const valor = parseFloat(document.getElementById('editAmount').value);

        // valida os dados
        if (!nome) throw new Error('Nome da meta é obrigatório.');
        if (isNaN(valor) || valor <= 0) throw new Error('Valor da meta deve ser um número positivo.');

        // obtém o ID da meta atual
        const metaAtual = metas[indiceMetaAtual];
        const metaId = metaAtual.id;

        // preserva a data de criação original ou usar data atual se inválida
        const dataCriacaoOriginal = metaAtual.dataCriacao;
        const dataCriacao = garantirDataValida(dataCriacaoOriginal);
        const ultimaAtualizacao = new Date();

        // cria um novo objeto de meta em vez de tentar modificar o existente
        const metaAtualizada = {
            id: metaId,
            nome: nome,
            descricao: descricao,
            valor: valor,
            dataCriacao: dataCriacao,
            ultimaAtualizacao: ultimaAtualizacao
        };

        // atualiza no Firestore - envia objeto simples sem métodos de Date
        await FirestoreService.updateMeta(metaId, {
            nome: nome,
            descricao: descricao,
            valor: valor,
            dataCriacao: dataCriacao.toISOString(),
            ultimaAtualizacao: ultimaAtualizacao.toISOString()
        });

        // substitui o objeto antigo pelo novo
        metas[indiceMetaAtual] = metaAtualizada;

        // salva no localStorage
        salvarDados();

        // exibe mensagem de sucesso
        Swal.fire({
            title: 'Sucesso!',
            text: 'Meta atualizada com sucesso.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        // fechar o modal
        fecharModalEdicao();

        // atualiza a exibição
        exibirMetas();
        calcularEstimativas();

    } catch (erro) {
        console.error("Erro ao salvar edição:", erro);
        Swal.fire({
            title: 'Erro!',
            text: erro.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// exclui uma meta existente
async function excluirMeta(indice) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter esta ação!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const meta = metas[indice];

                // verifica se a meta tem ID do Firestore antes de tentar excluir
                if (meta.id) {
                    await FirestoreService.deleteMeta(meta.id);
                }

                // remove localmente
                metas.splice(indice, 1);
                salvarDados();
                exibirMetas();
                setTimeout(() => {
                    calcularEstimativas();
                }, 100);

                Swal.fire({
                    title: 'Excluído!',
                    text: 'Sua meta foi excluída com sucesso',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (erro) {
                console.error('Erro ao excluir meta:', erro);
                Swal.fire({
                    title: 'Erro!',
                    text: 'Ocorreu um erro ao excluir a meta: ' + erro.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

// função para configurar eventos dos filtros
function setupFilters() {
    // botão e cabeçalho para mostrar/esconder filtros
    const btnToggleFilter = document.querySelector('.btn-toggle-filter');
    const filterCardHeader = document.querySelector('.filter-container .card-header');
    const filterCollapse = document.getElementById('filterCollapse');

    // verifica se bootstrap está disponível antes de usá-lo
    let bsCollapse;
    if (window.bootstrap && window.bootstrap.Collapse) {
        bsCollapse = new bootstrap.Collapse(filterCollapse, {
            toggle: false
        });
    } else {
        // fallback para quando bootstrap não está disponível
        bsCollapse = {
            toggle: function() {
                if (filterCollapse) {
                    if (filterCollapse.classList.contains('show')) {
                        filterCollapse.classList.remove('show');
                    } else {
                        filterCollapse.classList.add('show');
                    }
                }
            }
        };
    }

    if (filterCardHeader) {
        filterCardHeader.style.cursor = 'pointer';
        filterCardHeader.addEventListener('click', (e) => {
            // evitar que o clique no botão da seta acione este evento duas vezes
            if (e.target.closest('.btn-toggle-filter')) {
                return;
            }
            bsCollapse.toggle();

            // atualiza o ícone da seta
            const icon = filterCardHeader.querySelector('.btn-toggle-filter i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    }

    if (btnToggleFilter) {
        btnToggleFilter.addEventListener('click', (e) => {
            e.stopPropagation(); // impede propagação para o card-header
            bsCollapse.toggle();

            // atualiza o ícone da seta
            const icon = btnToggleFilter.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    }

    // botões para limpar filtros individuais
    document.querySelectorAll('.clear-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filtro = e.target.closest('button').dataset.filter;
            limparFiltro(filtro);
        });
    });

    // botão para limpar todos os filtros
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', limparTodosFiltros);
    }

    // botão para aplicar filtros
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', aplicarFiltros);
    }

    // aplica filtros ao pressionar Enter no campo de texto
    const filterTextInput = document.getElementById('filterText');
    if (filterTextInput) {
        filterTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });
    }
}

// função para limpar um filtro específico
function limparFiltro(filtro) {
    switch (filtro) {
        case 'text':
            document.getElementById('filterText').value = '';
            filtros.texto = '';
            break;
        case 'amount':
            document.getElementById('filterAmount').value = '';
            filtros.valorMaximo = null;
            break;
    }

    // aplica os filtros imediatamente ao limpar um filtro
    aplicarFiltros();
}

// função para limpar todos os filtros
function limparTodosFiltros() {
    document.getElementById('filterText').value = '';
    document.getElementById('filterAmount').value = '';

    filtros = {
        texto: '',
        valorMaximo: null
    };

    // aplica os filtros (agora limpos)
    aplicarFiltros();
}

// função para aplicar os filtros
function aplicarFiltros() {
    // coleta valores dos campos de filtro
    filtros.texto = document.getElementById('filterText').value.toLowerCase().trim();

    const amountValue = document.getElementById('filterAmount').value;
    filtros.valorMaximo = amountValue ? parseFloat(amountValue) : null;

    // exibir metas filtradas
    exibirMetas();
}

function setupAutoUpdates() {
    // escuta eventos de atualização de gastos
    document.addEventListener('dadosGastosAtualizados', () => {
        console.log("Atualizando metas devido a mudanças em gastos");
        const user = Auth.getLoggedInUser();
        if (user && user.email) {
            carregarDadosFinanceirosLocais(user.email);
            calcularEstimativas();
        }
    });

    // escuta eventos de atualização de receitas
    document.addEventListener('dadosReceitasAtualizados', () => {
        console.log("Atualizando metas devido a mudanças em receitas");
        const user = Auth.getLoggedInUser();
        if (user && user.email) {
            carregarDadosFinanceirosLocais(user.email);
            calcularEstimativas();
        }
    });
}

// inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();

    // configura filtros
    setupFilters();

    // configura atualizações automáticas
    setupAutoUpdates();

    exibirMetas();
    calcularEstimativas();
    
    // inicializa responsividade de tabelas
    inicializarResponsividadeTabelas();

    // eventos
    const formularioMeta = document.getElementById('goalForm');
    if (formularioMeta) {
        formularioMeta.addEventListener('submit', adicionarMeta);
    }

    const botaoFechar = document.querySelector(".close");
    if (botaoFechar) {
        botaoFechar.addEventListener("click", fecharModalEdicao);
    }

    window.addEventListener("click", (event) => {
        if (event.target == modalEdicao) {
            fecharModalEdicao();
        }
    });

    if (formularioEdicaoMeta) {
        formularioEdicaoMeta.addEventListener('submit', salvarEdicaoMeta);
    }

    // funções necessárias globalmente
    window.abrirModalEdicao = abrirModalEdicao;
    window.excluirMeta = excluirMeta;
    window.fecharModalEdicao = fecharModalEdicao;
    window.limparTodosFiltros = limparTodosFiltros; // expõe para uso no HTML
    window.limparFiltro = limparFiltro; // expõe para uso no HTML
});