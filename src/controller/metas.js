import { Meta } from "../model/Meta.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";

// Verificar autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Configure user account buttons
function setupUserAccountActions() {
    // Debug para verificar Auth module
    console.log("Auth module loaded:", Auth);
    console.log("Auth.logout exists:", typeof Auth.logout === 'function');
    console.log("Auth.isAuthenticated exists:", typeof Auth.isAuthenticated === 'function');

    // Função de logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Logout button clicked");
            try {
                // Verificar se temos o usuário antes de sair
                const user = Auth.getLoggedInUser();
                console.log("Current user before logout:", user);
                
                // Chamada explícita para limpar local storage
                localStorage.removeItem('loggedInUser');
                console.log("Removed user from localStorage");
                
                // Forçar redirecionamento para a página de login
                console.log("Redirecting to login page...");
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Ocorreu um erro ao sair da conta: ' + (error.message || 'Tente novamente mais tarde'));
            }
        });
        console.log("Logout button event listener added");
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
        console.log("Delete account button event listener added");
    } else {
        console.error("Delete account button not found in the DOM");
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

// array para armazenar as metas
let metas = [];
// Variáveis para armazenar dados financeiros
let saldoMensal = 0;
let receitasMensais = 0;
let gastosMensais = 0;

// carregar metas do localStorage
function carregarDados() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.email) {
        console.error('Usuário não encontrado ou sem email');
        return;
    }

    const metasStorage = localStorage.getItem(`metas_${user.email}`);

    if (metasStorage) {
        const metasData = JSON.parse(metasStorage);
        metas = metasData.map(data => {
            try {
                return new Meta(data.nome, data.descricao, data.valor, data.dataCriacao);
            } catch (erro) {
                console.error('Erro ao carregar meta:', erro);
                return null;
            }
        }).filter(meta => meta !== null);
    }

    // Carregar receitas
    const receitasStorage = localStorage.getItem(`receitas_${user.email}`);
    if (receitasStorage) {
        try {
            const receitas = JSON.parse(receitasStorage);
            receitasMensais = calcularMediaMensal(receitas);
        } catch (erro) {
            console.error('Erro ao carregar receitas:', erro);
            receitasMensais = 0;
        }
    }

    // Carregar gastos
    const gastosStorage = localStorage.getItem(`gastos_${user.email}`);
    if (gastosStorage) {
        try {
            const gastos = JSON.parse(gastosStorage);
            gastosMensais = calcularMediaMensal(gastos);
        } catch (erro) {
            console.error('Erro ao carregar gastos:', erro);
            gastosMensais = 0;
        }
    }

    // Calcular saldo mensal
    saldoMensal = receitasMensais - gastosMensais;
    atualizarSaldoMensal();
}

// Função para calcular a média mensal de receitas ou gastos
function calcularMediaMensal(items) {
    if (!items || items.length === 0) return 0;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Filtrar itens do mês atual
    const itensMesAtual = items.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem.getMonth() === mesAtual && dataItem.getFullYear() === anoAtual;
    });

    // Somar valores
    const total = itensMesAtual.reduce((soma, item) => soma + parseFloat(item.valor), 0);

    return total;
}

// Atualizar o elemento de interface com o saldo mensal
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

// Calcular e exibir estimativas para as metas
function calcularEstimativas() {
    const container = document.getElementById('estimativas-container');
    const placeholder = document.getElementById('estimativas-placeholder');

    // Verificar se os elementos existem antes de prosseguir
    if (!container) {
        console.error('Elemento estimativas-container não encontrado');
        return;
    }

    // Limpar container atual
    container.innerHTML = '';

    // Se não há metas ou saldo mensal é zero ou negativo
    if (metas.length === 0) {
        // Verificar se o placeholder existe antes de modificar sua propriedade style
        if (placeholder) {
            placeholder.style.display = 'block';
        } else {
            // Se não existir, criar um placeholder alternativo
            const noGoalsMessage = document.createElement('div');
            noGoalsMessage.className = 'alert alert-info';
            noGoalsMessage.textContent = 'Nenhuma meta adicionada ainda.';
            container.appendChild(noGoalsMessage);
        }
        return;
    } else if (placeholder) {
        placeholder.style.display = 'none';
    }

    // Se o saldo mensal for zero ou negativo, mostrar um alerta
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

    // Criar uma tabela para as estimativas
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

    // Adicionar cada meta à tabela
    metas.forEach(meta => {
        const tr = document.createElement('tr');

        // Calcular meses necessários
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

        // Calcular a porcentagem de progresso com base na proporção do saldo mensal para o valor total
        const porcentagemMensal = (saldoMensal / meta.valor) * 100;
        const porcentagemProgress = Math.min(100, porcentagemMensal); // Limitar a 100%

        // Determinar a classe de cor para a barra de progresso
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
}

// salvar metas no localStorage
function salvarDados() {
    const user = Auth.getLoggedInUser();
    if (!user || !user.email) {
        console.error('Erro ao salvar metas: usuário não encontrado ou sem email');
        return;
    }
    localStorage.setItem(`metas_${user.email}`, JSON.stringify(metas));
}

// exibir as metas na lista
function exibirMetas() {
    const listaMetas = document.getElementById('goalsList');
    if (!listaMetas) return;

    listaMetas.innerHTML = '';

    if (metas.length === 0) {
        listaMetas.innerHTML = '<div class="alert alert-info">Nenhuma meta adicionada ainda.</div>';
        return;
    }

    // Criar tabela para exibir as metas
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    metas.forEach((meta, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${meta.nome}</td>
            <td>${meta.descricao}</td>
            <td>R$ ${meta.valor.toFixed(2)}</td>
            <td>${new Date(meta.dataCriacao).toLocaleDateString()}</td>
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
}

// função para adicionar uma nova meta
function adicionarMeta(evento) {
    evento.preventDefault();

    try {
        const nomeInput = document.getElementById('name');
        const descricaoInput = document.getElementById('description');
        const valorInput = document.getElementById('amount');

        const meta = new Meta(
            nomeInput.value,
            descricaoInput.value,
            parseFloat(valorInput.value)
        );

        metas.push(meta);
        salvarDados();

        // limpar formulário
        nomeInput.value = '';
        descricaoInput.value = '';
        valorInput.value = '';

        exibirMetas();
        // Chamar explicitamente calcularEstimativas após adicionar uma meta
        calcularEstimativas();

        // Mostrar mensagem de sucesso
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-success alert-dismissible fade show';
        alertElement.innerHTML = `
            <strong>Sucesso!</strong> Meta "${meta.nome}" adicionada com sucesso.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Inserir alerta após o formulário
        const formContainer = document.querySelector('.form-container');
        formContainer.appendChild(alertElement);

        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 3000);
    } catch (erro) {
        alert(erro.message);
    }
}

// referências ao modal
const modalEdicao = document.getElementById('editModal');
const inputNomeEdicao = document.getElementById('editName');
const inputDescricaoEdicao = document.getElementById('editDescription');
const inputValorEdicao = document.getElementById('editAmount');
const formularioEdicaoMeta = document.getElementById('editGoalForm');

let indiceMetaAtual = -1;

// abrir o modal de edição
function abrirModalEdicao(indice) {
    indiceMetaAtual = indice;
    const meta = metas[indice];

    inputNomeEdicao.value = meta.nome;
    inputDescricaoEdicao.value = meta.descricao;
    inputValorEdicao.value = meta.valor;

    modalEdicao.style.display = "block";
}

// fechar o modal
function fecharModalEdicao() {
    modalEdicao.style.display = "none";
}

// salvar as alterações da meta
function salvarEdicaoMeta(evento) {
    evento.preventDefault();

    try {
        const meta = new Meta(
            inputNomeEdicao.value,
            inputDescricaoEdicao.value,
            parseFloat(inputValorEdicao.value)
        );

        metas[indiceMetaAtual] = meta;
        salvarDados();
        fecharModalEdicao();
        exibirMetas();
        setTimeout(() => {
            calcularEstimativas();
        }, 100);
    } catch (erro) {
        alert(erro.message);
    }
}

// excluir uma meta existente
function excluirMeta(indice) {
    if (confirm('Tem certeza de que deseja excluir esta meta?')) {
        metas.splice(indice, 1);
        salvarDados();
        exibirMetas();
        setTimeout(() => {
            calcularEstimativas();
        }, 100);
    }
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupUserAccountActions();
    carregarDados();
    exibirMetas();
    setTimeout(() => {
        calcularEstimativas();
    }, 100);

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
});