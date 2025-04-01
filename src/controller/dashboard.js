import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";

// Verificar autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Configure user account buttons
function setupUserAccountActions() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Logout button clicked");
            try {
                // Verificar se temos o usuário antes de sair
                const user = Auth.getLoggedInUser();

                // Chamada explícita para limpar local storage
                localStorage.removeItem('loggedInUser');

                // Forçar redirecionamento para a página de login
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Ocorreu um erro ao sair da conta: ' + (error.message || 'Tente novamente mais tarde'));
            }
        });
    } else {
        console.error("Logout button not found in the DOM");
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

// Função para obter dados do localStorage
function obterDados() {
    const user = Auth.getLoggedInUser();
    const gastos = JSON.parse(localStorage.getItem(`gastos_${user.email}`)) || [];
    const receitas = JSON.parse(localStorage.getItem(`receitas_${user.email}`)) || [];
    return { gastos, receitas };
}

// Função para calcular totais
function calcularTotais() {
    const { gastos, receitas } = obterDados();

    const totalGastos = gastos.reduce((total, gasto) => total + parseFloat(gasto.valor), 0);
    const totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    const saldo = totalReceitas - totalGastos;

    // Atualizar elementos HTML
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('totalReceitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);

    return { totalGastos, totalReceitas, saldo };
}

// Função para carregar metas do localStorage
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

// Função para exibir as metas no dashboard
function exibirMetasNoDashboard() {
    const metas = carregarMetas();
    const container = document.getElementById('metas-container');
    const placeholder = document.getElementById('metas-placeholder');

    if (!container) return;

    // Limpar o container atual
    container.innerHTML = '';

    // Se não há metas
    if (metas.length === 0) {
        if (placeholder) placeholder.style.display = 'block';
        return;
    } else {
        if (placeholder) placeholder.style.display = 'none';
    }

    // Calcular o saldo mensal para estimativas
    const { totalReceitas, totalGastos } = calcularTotais();
    const saldoMensal = totalReceitas - totalGastos;

    // Exibir apenas as 3 metas mais recentes
    const metasRecentes = metas.slice(0, 3);

    metasRecentes.forEach(meta => {
        const card = document.createElement('div');
        card.className = 'card mb-2 border-0 bg-light';

        // Calcular estimativa
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

        // Calcular a porcentagem de progresso
        const porcentagemMensal = saldoMensal > 0 ? (saldoMensal / meta.valor) * 100 : 0;
        const porcentagemProgress = Math.min(100, porcentagemMensal);

        // Determinar a classe de cor para a barra de progresso
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

        card.innerHTML = `
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="card-title mb-0">${meta.nome}</h6>
                    <span class="badge bg-primary">R$ ${parseFloat(meta.valor).toFixed(2)}</span>
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

    // Se há mais metas do que as exibidas
    if (metas.length > 3) {
        const maisMetasText = document.createElement('p');
        maisMetasText.className = 'text-center small text-muted mt-2';
        maisMetasText.textContent = `+ ${metas.length - 3} outras metas`;
        container.appendChild(maisMetasText);
    }
}

// Função para agrupar dados por mês
function agruparPorMes(dados) {
    const hoje = new Date();
    const ultimosMeses = {};

    // Inicializar os últimos 6 meses com zero
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        ultimosMeses[chave] = 0;
    }

    // Somar valores por mês
    dados.forEach(item => {
        const data = new Date(item.data);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (chave in ultimosMeses) {
            ultimosMeses[chave] += parseFloat(item.valor);
        }
    });

    return Object.values(ultimosMeses);
}

// Função para agrupar gastos por categoria
function agruparGastosPorCategoria(gastos) {
    const categorias = {};

    gastos.forEach(gasto => {
        if (!categorias[gasto.categoria]) {
            categorias[gasto.categoria] = 0;
        }
        categorias[gasto.categoria] += parseFloat(gasto.valor);
    });

    return categorias;
}

// Função para gerar cores aleatórias
function gerarCores(quantidade) {
    const cores = [];
    for (let i = 0; i < quantidade; i++) {
        const cor = `hsl(${(i * 360) / quantidade}, 70%, 50%)`;
        cores.push(cor);
    }
    return cores;
}

// Variáveis para armazenar as instâncias dos gráficos
let gastosReceitasChart = null;
let gastosPorCategoriaChart = null;

// Função para criar ou atualizar o gráfico de barras (Gastos vs Receitas)
function criarGraficoGastosReceitas() {
    const { gastos, receitas } = obterDados();
    const gastosporMes = agruparPorMes(gastos);
    const receitasporMes = agruparPorMes(receitas);

    const ctx = document.getElementById('gastosReceitasChart').getContext('2d');

    // Gerar labels para os últimos 6 meses
    const labels = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(data.toLocaleString('pt-BR', { month: 'short' }));
    }

    // Destruir o gráfico existente se houver
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
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatarMoeda(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

// Função para criar ou atualizar o gráfico de pizza (Distribuição de Gastos)
function criarGraficoGastosPorCategoria() {
    const { gastos } = obterDados();
    const gastosPorCategoria = agruparGastosPorCategoria(gastos);

    const categorias = Object.keys(gastosPorCategoria);
    const valores = Object.values(gastosPorCategoria);
    const cores = gerarCores(categorias.length);

    const ctx = document.getElementById('gastosPorCategoriaChart').getContext('2d');

    // Destruir o gráfico existente se houver
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
                            const valor = formatarMoeda(context.raw);
                            const categoria = context.label;
                            return `${categoria}: ${valor}`;
                        }
                    }
                }
            }
        }
    });
}

// Função para atualizar todos os dados do dashboard
function atualizarDashboard() {
    calcularTotais();
    criarGraficoGastosReceitas();
    criarGraficoGastosPorCategoria();
    exibirMetasNoDashboard();
}

// Função para criar um evento personalizado de atualização
function configurarAtualizacaoAutomatica() {
    // Substitui o getItem e setItem padrão do localStorage para interceptar mudanças
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        // Chama o método original
        originalSetItem.call(this, key, value);

        // Verifica se a chave é relacionada a gastos ou receitas ou metas
        const user = Auth.getLoggedInUser();
        if (user && (key === `gastos_${user.email}` || key === `receitas_${user.email}` || key === `metas_${user.email}`)) {
            // Atualiza o dashboard
            atualizarDashboard();
        }
    };

    // Verifica por mudanças de outras abas também
    window.addEventListener('storage', (event) => {
        const user = Auth.getLoggedInUser();
        if (user && (event.key === `gastos_${user.email}` || event.key === `receitas_${user.email}` || event.key === `metas_${user.email}`)) {
            atualizarDashboard();
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Configura botões de gerenciamento de conta
    setupUserAccountActions();

    // Configura a atualização automática
    configurarAtualizacaoAutomatica();

    // Inicializa o dashboard
    atualizarDashboard();

    // Atualiza a cada minuto para garantir dados atualizados
    setInterval(atualizarDashboard, 60000);
});