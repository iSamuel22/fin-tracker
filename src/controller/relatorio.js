import { Auth } from "../services/Auth.js";

// Verificar autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Configure user account buttons
function setupUserAccountActions() {
    // Função de logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }

    // Função de excluir conta
    const deleteAccountButton = document.getElementById('delete-account-button');
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            showDeleteAccountConfirmation();
        });
    }
}

// Mostrar confirmação antes de excluir a conta
function showDeleteAccountConfirmation() {
    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">Excluir Conta</h5>
                    <button type="button" class="btn-close btn-close-white" id="close-delete-modal"></button>
                </div>
                <div class="modal-body">
                    <p>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</p>
                    <p class="text-danger fw-bold">Todos os seus dados serão permanentemente excluídos:</p>
                    <ul>
                        <li>Gastos</li>
                        <li>Receitas</li>
                        <li>Metas</li>
                        <li>Configurações</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancel-delete-account">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-account">
                        <i class="fas fa-trash me-2"></i>Sim, excluir minha conta
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    // Event listeners para botões do modal
    document.getElementById('close-delete-modal').addEventListener('click', () => {
        closeDeleteModal(modal);
    });

    document.getElementById('cancel-delete-account').addEventListener('click', () => {
        closeDeleteModal(modal);
    });

    document.getElementById('confirm-delete-account').addEventListener('click', async () => {
        try {
            // Show loading state
            const confirmButton = document.getElementById('confirm-delete-account');
            const originalText = confirmButton.innerHTML;
            confirmButton.disabled = true;
            confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';

            // Delete the account
            await deleteUserAccount();

            // Show success message
            alert('Sua conta foi excluída com sucesso.');

            // Redirect to login page
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Ocorreu um erro ao excluir sua conta: ' + (error.message || 'Tente novamente mais tarde'));

            // Reset button state
            const confirmButton = document.getElementById('confirm-delete-account');
            confirmButton.disabled = false;
            confirmButton.innerHTML = originalText;
        } finally {
            closeDeleteModal(modal);
        }
    });
}

// Fechar modal de confirmação
function closeDeleteModal(modal) {
    document.body.removeChild(modal);
    document.body.classList.remove('modal-open');
}

// Excluir conta do usuário com cascata
async function deleteUserAccount() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.uid) {
        throw new Error('Usuário não encontrado');
    }

    try {
        console.log("Iniciando processo de exclusão de conta");

        // Step 1: Get user data before we delete anything
        const userId = user.uid;
        const userEmail = user.email;

        // Step 2: Delete user from Firebase Authentication
        console.log("Excluindo usuário do Firebase Authentication");
        await Auth.deleteUserAccount();

        // Step 3: Delete user data from Firestore
        console.log("Excluindo dados do Firestore");
        await FirestoreService.deleteUserData(userId);

        // Step 4: Clean up localStorage
        console.log("Limpando dados do localStorage");
        cleanupLocalStorage(userEmail);

        console.log("Exclusão de conta completa");
        return true;
    } catch (error) {
        console.error("Erro completo na exclusão da conta:", error);
        throw error;
    }
}

// Helper function to clean localStorage
function cleanupLocalStorage(userEmail) {
    if (!userEmail) return;

    // List of prefixes to check
    const prefixes = ['gastos_', 'receitas_', 'metas_', 'configuracoes_'];

    // Remove items with these prefixes
    prefixes.forEach(prefix => {
        localStorage.removeItem(`${prefix}${userEmail}`);
    });

    // Finally remove the user
    localStorage.removeItem('loggedInUser');
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Função para obter dados do localStorage
function obterDados() {
    const user = Auth.getLoggedInUser();
    const gastos = JSON.parse(localStorage.getItem(`gastos_${user.email}`)) || [];
    const receitas = JSON.parse(localStorage.getItem(`receitas_${user.email}`)) || [];
    return { gastos, receitas };
}

// Função para filtrar dados por período
function filtrarDadosPorPeriodo(dados, dataInicio, dataFim) {
    return dados.filter(item => {
        const data = new Date(item.data);
        return data >= dataInicio && data <= dataFim;
    });
}

// Função para calcular totais do período
function calcularTotaisPeriodo(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();

    const gastosFiltrados = filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);
    const receitasFiltradas = filtrarDadosPorPeriodo(receitas, dataInicio, dataFim);

    const totalGastos = gastosFiltrados.reduce((total, gasto) => total + parseFloat(gasto.valor), 0);
    const totalReceitas = receitasFiltradas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    const saldo = totalReceitas - totalGastos;

    // Calcular economia média mensal
    const meses = Math.max(1, Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24 * 30)));
    const economiaMedia = saldo / meses;

    // Atualizar elementos HTML
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('totalReceitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);
    document.getElementById('economiaMedia').textContent = formatarMoeda(economiaMedia);

    return { totalGastos, totalReceitas, saldo, economiaMedia };
}

let evolucaoFinanceiraChart;
let topCategoriasChart;
let tendenciasChart;
let comparativoMensalChart;

// Função para criar gráfico de evolução financeira
function criarGraficoEvolucaoFinanceira(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const ctx = document.getElementById('evolucaoFinanceiraChart').getContext('2d');

    // Criar array de datas para o período
    const datas = [];
    let dataAtual = new Date(dataInicio);
    while (dataAtual <= dataFim) {
        datas.push(new Date(dataAtual));
        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Calcular saldo acumulado para cada data
    const saldos = datas.map(data => {
        const gastosAte = gastos.filter(g => new Date(g.data) <= data)
            .reduce((total, g) => total + parseFloat(g.valor), 0);
        const receitasAte = receitas.filter(r => new Date(r.data) <= data)
            .reduce((total, r) => total + parseFloat(r.valor), 0);
        return receitasAte - gastosAte;
    });

    if (evolucaoFinanceiraChart) {
        evolucaoFinanceiraChart.destroy();
    }

    evolucaoFinanceiraChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datas.map(data => data.toLocaleDateString('pt-BR')),
            datasets: [{
                label: 'Saldo Acumulado',
                data: saldos,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatarMoeda(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => formatarMoeda(context.raw)
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de top categorias
function criarGraficoTopCategorias(dataInicio, dataFim) {
    const { gastos } = obterDados();
    const gastosFiltrados = filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);

    // Agrupar por categoria
    const categorias = {};
    gastosFiltrados.forEach(gasto => {
        if (!categorias[gasto.categoria]) {
            categorias[gasto.categoria] = 0;
        }
        categorias[gasto.categoria] += parseFloat(gasto.valor);
    });

    // Ordenar categorias por valor
    const categoriasOrdenadas = Object.entries(categorias)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5 categorias

    const ctx = document.getElementById('topCategoriasChart').getContext('2d');

    if (topCategoriasChart) {
        topCategoriasChart.destroy();
    }

    topCategoriasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoriasOrdenadas.map(([categoria]) => categoria),
            datasets: [{
                data: categoriasOrdenadas.map(([, valor]) => valor),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${formatarMoeda(context.raw)}`
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de tendências
function criarGraficoTendencias(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const ctx = document.getElementById('tendenciasChart').getContext('2d');

    // Agrupar por mês
    const dadosPorMes = {};

    function agruparPorMes(dados, tipo) {
        dados.forEach(item => {
            const data = new Date(item.data);
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

            if (!dadosPorMes[chave]) {
                dadosPorMes[chave] = { gastos: 0, receitas: 0 };
            }

            dadosPorMes[chave][tipo] += parseFloat(item.valor);
        });
    }

    agruparPorMes(gastos, 'gastos');
    agruparPorMes(receitas, 'receitas');

    // Ordenar meses
    const mesesOrdenados = Object.keys(dadosPorMes).sort();

    if (tendenciasChart) {
        tendenciasChart.destroy();
    }

    tendenciasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mesesOrdenados.map(mes => {
                const [ano, mesNum] = mes.split('-');
                return new Date(ano, mesNum - 1).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Receitas',
                    data: mesesOrdenados.map(mes => dadosPorMes[mes].receitas),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Gastos',
                    data: mesesOrdenados.map(mes => dadosPorMes[mes].gastos),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatarMoeda(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${formatarMoeda(context.raw)}`
                    }
                }
            }
        }
    });
}

// Função para criar gráfico comparativo mensal
function criarGraficoComparativoMensal(dataInicio, dataFim) {
    const { gastos } = obterDados();
    const ctx = document.getElementById('comparativoMensalChart').getContext('2d');

    // Agrupar gastos por categoria e mês
    const dadosPorCategoria = {};
    gastos.forEach(gasto => {
        const data = new Date(gasto.data);
        const mes = data.toLocaleString('pt-BR', { month: 'short' });

        if (!dadosPorCategoria[gasto.categoria]) {
            dadosPorCategoria[gasto.categoria] = {};
        }

        if (!dadosPorCategoria[gasto.categoria][mes]) {
            dadosPorCategoria[gasto.categoria][mes] = 0;
        }

        dadosPorCategoria[gasto.categoria][mes] += parseFloat(gasto.valor);
    });

    // Preparar dados para o gráfico
    const categorias = Object.keys(dadosPorCategoria);
    const meses = [...new Set(gastos.map(g =>
        new Date(g.data).toLocaleString('pt-BR', { month: 'short' })
    ))].sort();

    if (comparativoMensalChart) {
        comparativoMensalChart.destroy();
    }

    comparativoMensalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: categorias.map((categoria, index) => ({
                label: categoria,
                data: meses.map(mes => dadosPorCategoria[categoria][mes] || 0),
                backgroundColor: `hsl(${(index * 360) / categorias.length}, 70%, 50%)`
            }))
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: value => formatarMoeda(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${formatarMoeda(context.raw)}`
                    }
                }
            }
        }
    });
}

// Função para atualizar tabela de transações
function atualizarTabelaTransacoes(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const tbody = document.getElementById('tabelaTransacoes');

    // Combinar e ordenar transações
    const transacoes = [
        ...gastos.map(g => ({ ...g, tipo: 'Gasto' })),
        ...receitas.map(r => ({ ...r, tipo: 'Receita' }))
    ]
        .filter(t => {
            const data = new Date(t.data);
            return data >= dataInicio && data <= dataFim;
        })
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    // Limpar tabela
    tbody.innerHTML = '';

    // Preencher tabela
    transacoes.forEach(transacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td><span class="badge ${transacao.tipo === 'Receita' ? 'bg-success' : 'bg-danger'}">${transacao.tipo}</span></td>
            <td>${formatarMoeda(transacao.valor)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para atualizar todos os relatórios
function atualizarRelatorios() {
    const periodoSelect = document.getElementById('periodoSelect');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');

    // Se período personalizado não estiver selecionado, calcular datas
    if (periodoSelect.value !== 'personalizado') {
        const dias = parseInt(periodoSelect.value);
        const hoje = new Date();
        dataFim.valueAsDate = hoje;
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - dias);
        dataInicio.valueAsDate = inicio;
    }

    const dataInicioObj = new Date(dataInicio.value);
    const dataFimObj = new Date(dataFim.value);

    calcularTotaisPeriodo(dataInicioObj, dataFimObj);
    criarGraficoEvolucaoFinanceira(dataInicioObj, dataFimObj);
    criarGraficoTopCategorias(dataInicioObj, dataFimObj);
    criarGraficoTendencias(dataInicioObj, dataFimObj);
    criarGraficoComparativoMensal(dataInicioObj, dataFimObj);
    atualizarTabelaTransacoes(dataInicioObj, dataFimObj);
}

// função para criar um evento personalizado de atualização
function configurarAtualizacaoAutomatica() {
    // substitui o getItem e setItem padrão do localStorage para interceptar mudanças
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        // chama o método original
        originalSetItem.call(this, key, value);

        // verifica se a chave é relacionada a gastos ou receitas
        const user = Auth.getLoggedInUser();
        if (user && (key === `gastos_${user.email}` || key === `receitas_${user.email}`)) {
            // atualiza os relatórios
            atualizarRelatorios();
        }
    };

    // verifica por mudanças de outras abas também
    window.addEventListener('storage', (event) => {
        const user = Auth.getLoggedInUser();
        if (user && (event.key === `gastos_${user.email}` || event.key === `receitas_${user.email}`)) {
            atualizarRelatorios();
        }
    });
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupUserAccountActions();
    // configura a atualização automática
    configurarAtualizacaoAutomatica();

    const periodoSelect = document.getElementById('periodoSelect');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');

    // configurar data inicial como hoje menos 180 dias (6 meses)
    const hoje = new Date();
    dataFim.valueAsDate = hoje;
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 180);
    dataInicio.valueAsDate = inicio;

    // Eventos
    periodoSelect.addEventListener('change', () => {
        if (periodoSelect.value === 'personalizado') {
            dataInicio.disabled = false;
            dataFim.disabled = false;
        } else {
            dataInicio.disabled = true;
            dataFim.disabled = true;
            atualizarRelatorios();
        }
    });

    dataInicio.addEventListener('change', atualizarRelatorios);
    dataFim.addEventListener('change', atualizarRelatorios);

    // inicializa relatórios
    atualizarRelatorios();

    // atualizar a cada minuto para garantir dados atualizados
    setInterval(atualizarRelatorios, 60000);
});