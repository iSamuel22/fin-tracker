import { Meta } from "../model/Meta.js";
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

// array para armazenar as metas
let metas = [];

// carregar metas do localStorage
function carregarDados() {
    const user = Auth.getLoggedInUser();
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
}

// salvar metas no localStorage
function salvarDados() {
    const user = Auth.getLoggedInUser();
    localStorage.setItem(`metas_${user.email}`, JSON.stringify(metas));
}

// exibir as metas na lista
function exibirMetas() {
    const listaMetas = document.getElementById('goalsList');
    listaMetas.innerHTML = '';

    if (metas.length === 0) {
        listaMetas.innerHTML = '<p>Nenhuma meta adicionada ainda.</p>';
        return;
    }

    metas.forEach((meta, index) => {
        const itemMeta = document.createElement('div');
        itemMeta.classList.add('goal-item');
        itemMeta.innerHTML = `
            <span>${meta.nome}</span>
            <span>${meta.descricao}</span>
            <span>R$ ${meta.valor.toFixed(2)}</span>
            <span>${new Date(meta.dataCriacao).toLocaleDateString()}</span>
            <div>
                <button class="btn btn-edit" onclick="window.abrirModalEdicao(${index})">Editar</button>
                <button class="btn btn-delete" onclick="window.excluirMeta(${index})">Excluir</button>
            </div>
        `;
        listaMetas.appendChild(itemMeta);
    });
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
    }
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupUserAccountActions();
    carregarDados();
    exibirMetas();

    // eventos
    const formularioMeta = document.getElementById('goalForm');
    formularioMeta.addEventListener('submit', adicionarMeta);

    const botaoFechar = document.querySelector(".close");
    botaoFechar.addEventListener("click", fecharModalEdicao);

    window.addEventListener("click", (event) => {
        if (event.target == modalEdicao) {
            fecharModalEdicao();
        }
    });

    formularioEdicaoMeta.addEventListener('submit', salvarEdicaoMeta);

    // funções necessárias globalmente
    window.abrirModalEdicao = abrirModalEdicao;
    window.excluirMeta = excluirMeta;
    window.fecharModalEdicao = fecharModalEdicao;
});