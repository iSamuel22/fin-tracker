import { Gasto } from "../model/Gasto.js";
import { CategoriaGasto } from "../model/CategoriaGasto.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

// Verificar autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

let gastos = [];
let categorias = ['Alimentação', 'Transporte', 'Lazer', 'Moradia'];

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

// Função para salvar gastos no localStorage
function salvarGastosLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const gastosParaSalvar = gastos.map(g => ({
            id: g.id,
            descricao: g.descricao,
            valor: g.valor,
            data: g.data,
            categoria: g.categoria
        }));
        localStorage.setItem(`gastos_${user.email}`, JSON.stringify(gastosParaSalvar));
        console.log("Gastos salvos no localStorage:", gastosParaSalvar.length);
    }
}

// função para carregar gastos do localStorage
function carregarGastosLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const gastosStorage = localStorage.getItem(`gastos_${user.email}`);
        if (gastosStorage) {
            try {
                const gastosData = JSON.parse(gastosStorage);
                gastos = gastosData.map(data => {
                    const gasto = new Gasto(
                        data.descricao,
                        parseFloat(data.valor),
                        new Date(data.data),
                        data.categoria
                    );
                    gasto.id = data.id;
                    return gasto;
                });
                console.log("Gastos carregados do localStorage:", gastos.length);
                return true;
            } catch (e) {
                console.error("Erro ao carregar gastos do localStorage:", e);
            }
        }
    }
    return false;
}

// Carregar gastos e categorias do Firestore
async function carregarDados() {
    try {
        console.log("Iniciando carregamento de dados...");
        const user = Auth.getLoggedInUser();
        if (!user) {
            console.error("Usuário não autenticado ou não encontrado");
            window.location.href = 'login.html';
            return;
        }

        // Primeiro carregar categorias do localStorage
        const categoriasGastosStorage = localStorage.getItem(`categorias_gastos_${user.email}`);
        if (categoriasGastosStorage) {
            categorias = JSON.parse(categoriasGastosStorage);
            console.log("Categorias carregadas do localStorage:", categorias);
        }

        // Depois carregar gastos do localStorage para exibição rápida
        const dadosCarregadosDoLocal = carregarGastosLocalStorage();

        if (dadosCarregadosDoLocal) {
            console.log("Exibindo dados do localStorage enquanto carrega do Firestore");
            // Atualizar a interface com os dados do localStorage
            atualizarSelectCategorias();
            exibirGastos();
            // Disparar evento para atualizar relatórios
            notificarAlteracoesDados();
        }

        // Inicializar coleções e carregar dados do Firestore
        await FirestoreService.inicializarColecoes();
        const gastosData = await FirestoreService.getGastos();

        console.log("Gastos carregados do Firestore:", gastosData);

        // Filtrar documentos que não são de inicialização do sistema
        gastos = gastosData
            .filter(data => !data.isSystemGenerated)
            .map(data => {
                // Converter timestamp para Date se necessário
                const data_formatada = data.data instanceof Date ? data.data : new Date(data.data);

                // Criar nova instância de Gasto com ID do Firestore
                const gasto = new Gasto(
                    data.descricao,
                    parseFloat(data.valor),
                    data_formatada,
                    data.categoria
                );
                gasto.id = data.id; // Armazenar o ID do Firestore
                return gasto;
            });

        // Extrair categorias únicas dos gastos para atualizar a lista
        const categoriasFromGastos = [...new Set(gastos.map(g => g.categoria))];
        categoriasFromGastos.forEach(cat => {
            if (!categorias.includes(cat) && cat) {
                categorias.push(cat);
            }
        });

        // Salvar os dados atualizados no localStorage
        salvarGastosLocalStorage();
        salvarCategorias();

        // Atualizar a interface
        atualizarSelectCategorias();
        exibirGastos();

        notificarAlteracoesDados();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);

        // Verificar se é realmente um erro ou apenas falta de dados
        const isNetworkError = error instanceof TypeError && error.message.includes('network');
        const isPermissionError = error.code === 'permission-denied';
        const isAuthError = error.code === 'unauthenticated';

        // Para usuários novos ou sem dados, não mostrar erro
        if (isNetworkError || isPermissionError || isAuthError) {
            // Mostrar erro apenas para problemas reais de conexão ou permissão
            Swal.fire({
                title: 'Erro ao carregar dados',
                text: 'Ocorreu um erro de conexão. Por favor, verifique sua internet e tente novamente.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else {
            // Para outros casos (incluindo quando não há dados), apenas exibir a interface vazia
            console.log("Sem dados ou erro não crítico, exibindo interface vazia");
            exibirGastos(); // Isso vai mostrar "Nenhum gasto adicionado ainda."
            notificarAlteracoesDados();
        }
    }
}

// Salvar apenas categorias no localStorage
function salvarCategorias() {
    const user = Auth.getLoggedInUser();
    if (user) {
        localStorage.setItem(`categorias_gastos_${user.email}`, JSON.stringify(categorias));
        console.log("Categorias salvas no localStorage:", categorias);
    }
}

// Atualizar o select de categorias
function atualizarSelectCategorias() {
    const selects = [
        document.getElementById('category'),
        document.getElementById('editCategory')
    ];

    selects.forEach(select => {
        if (select) {
            // Salvar valor atual para preservar a seleção após a atualização
            const valorAtual = select.value;

            // Limpar opções existentes
            select.innerHTML = '<option value="">Selecione</option>';

            // Adicionar categorias
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                select.appendChild(option);
            });

            // Adicionar opção "Outros"
            const outrosOption = document.createElement('option');
            outrosOption.value = 'Outros';
            outrosOption.textContent = 'Outros';
            select.appendChild(outrosOption);

            // Restaurar valor selecionado se existia anteriormente
            if (valorAtual && select.querySelector(`option[value="${valorAtual}"]`)) {
                select.value = valorAtual;
            }
        }
    });
}

// Exibir os gastos na lista
function exibirGastos() {
    const listaGastos = document.getElementById('expensesList');

    if (!listaGastos) {
        console.error("Elemento 'expensesList' não encontrado no DOM!");
        return;
    }

    listaGastos.innerHTML = '';

    if (gastos.length === 0) {
        listaGastos.innerHTML = '<p>Nenhum gasto adicionado ainda.</p>';
        return;
    }

    // Ordenar gastos por data (mais recente primeiro)
    const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.data) - new Date(a.data));

    gastosOrdenados.forEach((gasto, index) => {
        const itemGasto = document.createElement('div');
        itemGasto.classList.add('expense-item');
        itemGasto.style.border = "1px solid #ccc";
        itemGasto.style.margin = "5px 0";
        itemGasto.style.padding = "10px";

        itemGasto.innerHTML = `
            <span>${gasto.descricao}</span>
            <span>R$ ${parseFloat(gasto.valor).toFixed(2)}</span>
            <span>${gasto.categoria}</span>
            <span>${new Date(gasto.data).toLocaleDateString()}</span>
            <div>
                <button class="btn btn-edit" onclick="window.abrirModalEdicao(${index})">Editar</button>
                <button class="btn btn-delete" onclick="window.excluirGasto(${index})">Excluir</button>
            </div>
        `;
        listaGastos.appendChild(itemGasto);
    });
}

// Função para adicionar um novo gasto
async function adicionarGasto(evento) {
    evento.preventDefault();

    try {
        const descricaoInput = document.getElementById('description');
        const valorInput = document.getElementById('amount');
        const selecaoCategoria = document.getElementById('category');
        const dataInput = document.getElementById('date');

        let categoria = selecaoCategoria.value;

        // Validar os campos
        if (!descricaoInput.value.trim()) {
            throw new Error('Por favor, insira uma descrição.');
        }
        if (!valorInput.value || isNaN(parseFloat(valorInput.value))) {
            throw new Error('Por favor, insira um valor numérico.');
        }
        if (!categoria) {
            throw new Error('Por favor, selecione uma categoria.');
        }
        if (!dataInput.value) {
            throw new Error('Por favor, selecione uma data.');
        }

        // Se a categoria for "Outros", pega o valor do campo de nova categoria
        if (categoria === 'Outros') {
            const novoNomeCategoria = document.getElementById('newCategoryName').value.trim();
            if (!novoNomeCategoria) {
                throw new Error('Por favor, insira o nome da nova categoria.');
            }

            // Criar nova categoria
            const novaCategoria = new CategoriaGasto(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // Adicionar a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
            }
        }

        // Mostrar loader
        Swal.fire({
            title: 'Salvando...',
            text: 'Aguarde enquanto salvamos seu gasto',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Criar nova instância de gasto
        const gasto = new Gasto(
            descricaoInput.value,
            parseFloat(valorInput.value),
            new Date(dataInput.value),
            categoria
        );

        // Salvar no Firestore
        const gastoData = {
            descricao: gasto.descricao,
            valor: gasto.valor,
            data: gasto.data,
            categoria: gasto.categoria
        };

        const novoGasto = await FirestoreService.addGasto(gastoData);
        gasto.id = novoGasto.id;
        gastos.push(gasto);
        salvarGastosLocalStorage();

        // Fechar o loader
        Swal.close();

        // Limpar formulário
        descricaoInput.value = '';
        valorInput.value = '';
        selecaoCategoria.value = '';
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryField').style.display = 'none';
        dataInput.value = '';

        // Exibir mensagem de sucesso
        Swal.fire({
            title: 'Sucesso!',
            text: 'Gasto adicionado com sucesso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        exibirGastos();
        notificarAlteracoesDados();
    } catch (erro) {
        Swal.close();
        Swal.fire({
            title: 'Erro',
            text: erro.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function notificarAlteracoesDados() {
    document.dispatchEvent(new CustomEvent('dadosGastosAtualizados'));
}

// Referências ao modal
const modalEdicao = document.getElementById('editModal');
const inputDescricaoEdicao = document.getElementById('editDescription');
const inputValorEdicao = document.getElementById('editAmount');
const selecaoCategoriaEdicao = document.getElementById('editCategory');
const inputDataEdicao = document.getElementById('editDate');
const formularioEdicaoGasto = document.getElementById('editExpenseForm');

let indiceGastoAtual = -1;

// Abrir o modal de edição
function abrirModalEdicao(indice) {
    indiceGastoAtual = indice;
    const gasto = gastos[indice];

    inputDescricaoEdicao.value = gasto.descricao;
    inputValorEdicao.value = gasto.valor;

    // Garantir que o select está atualizado antes de definir o valor
    atualizarSelectCategorias();

    // Definir a categoria correta no select
    selecaoCategoriaEdicao.value = gasto.categoria;

    // Verificar se precisamos mostrar o campo de nova categoria
    alternarCampoNovaCategoriaEdicao();

    // Formatar data para o formato esperado pelo input date (YYYY-MM-DD)
    const data = new Date(gasto.data);
    const dataFormatada = data.toISOString().split('T')[0];
    inputDataEdicao.value = dataFormatada;

    modalEdicao.style.display = "block";
}

// Fechar o modal
function fecharModalEdicao() {
    modalEdicao.style.display = "none";
}

// Alternar campo de nova categoria no modal de edição
function alternarCampoNovaCategoriaEdicao() {
    let campoNovaCategoria = document.getElementById('editNewCategoryField');

    // Se o campo não existir, criá-lo dinamicamente
    if (!campoNovaCategoria && selecaoCategoriaEdicao.value === 'Outros') {
        const editCategorySelect = document.getElementById('editCategory');
        if (editCategorySelect) {
            campoNovaCategoria = document.createElement('div');
            campoNovaCategoria.id = 'editNewCategoryField';
            campoNovaCategoria.innerHTML = `
                <label for="editNewCategoryName">Nome da nova categoria:</label>
                <input type="text" id="editNewCategoryName" class="form-control" placeholder="Digite o nome da nova categoria">
            `;
            editCategorySelect.parentNode.insertAdjacentElement('afterend', campoNovaCategoria);
        }
    }

    // Agora podemos verificar novamente e manipular o campo
    if (campoNovaCategoria) {
        campoNovaCategoria.style.display = selecaoCategoriaEdicao.value === 'Outros' ? 'block' : 'none';

        // Se estiver mostrando o campo, limpar o valor anterior e focar no input
        if (selecaoCategoriaEdicao.value === 'Outros') {
            const inputNovaCategoria = document.getElementById('editNewCategoryName');
            if (inputNovaCategoria) {
                inputNovaCategoria.value = '';
                // Focar o campo após um pequeno delay para garantir que o campo esteja visível
                setTimeout(() => {
                    inputNovaCategoria.focus();
                }, 100);
            }
        }
    }
}

// Salvar as alterações do gasto
async function salvarEdicaoGasto(evento) {
    evento.preventDefault();

    try {
        let categoria = selecaoCategoriaEdicao.value;

        // Se a categoria for "Outros", pega o valor do campo de nova categoria usando apenas o SweetAlert
        if (categoria === 'Outros') {
            // Usando apenas o SweetAlert para obter o nome da nova categoria
            const { value: novoNomeCategoria, isConfirmed } = await Swal.fire({
                title: 'Nova Categoria',
                input: 'text',
                inputLabel: 'Digite o nome da nova categoria',
                inputPlaceholder: 'Nome da categoria',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Salvar',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Por favor, digite um nome para a categoria';
                    }
                }
            });

            if (!novoNomeCategoria || !isConfirmed) {
                throw new Error('Operação cancelada pelo usuário');
            }

            // Criar nova categoria
            const novaCategoria = new CategoriaGasto(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // Adicionar a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
            }
        }

        // Mostrar loader
        Swal.fire({
            title: 'Atualizando...',
            text: 'Aguarde enquanto atualizamos seu gasto',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const gasto = new Gasto(
            inputDescricaoEdicao.value,
            parseFloat(inputValorEdicao.value),
            new Date(inputDataEdicao.value),
            categoria
        );

        // Obter o ID do Firestore do gasto atual
        const gastoAtual = gastos[indiceGastoAtual];
        gasto.id = gastoAtual.id;

        // Atualizar no Firestore
        const gastoData = {
            descricao: gasto.descricao,
            valor: gasto.valor,
            data: gasto.data,
            categoria: gasto.categoria
        };

        await FirestoreService.updateGasto(gasto.id, gastoData);
        gastos[indiceGastoAtual] = gasto;
        salvarGastosLocalStorage();

        // Fechar o loader
        Swal.close();

        // Exibir mensagem de sucesso
        Swal.fire({
            title: 'Sucesso!',
            text: 'Gasto atualizado com sucesso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        fecharModalEdicao();
        exibirGastos();
        notificarAlteracoesDados();
    } catch (erro) {
        Swal.close();
        Swal.fire({
            title: 'Erro',
            text: erro.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Excluir um gasto existente
async function excluirGasto(indice) {
    const confirmarExclusao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Você deseja excluir este gasto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (confirmarExclusao.isConfirmed) {
        try {
            // Mostrar loader
            Swal.fire({
                title: 'Excluindo...',
                text: 'Aguarde enquanto excluímos seu gasto',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const gasto = gastos[indice];
            await FirestoreService.deleteGasto(gasto.id);
            gastos.splice(indice, 1);
            salvarGastosLocalStorage();

            // Fechar o loader
            Swal.close();

            // Mensagem de sucesso
            Swal.fire({
                title: 'Excluído!',
                text: 'Seu gasto foi excluído com sucesso',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            exibirGastos();
            notificarAlteracoesDados();
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao excluir o gasto: ' + error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

function alternarCampoNovaCategoria() {
    const selecaoCategoria = document.getElementById('category');
    const campoNovaCategoria = document.getElementById('newCategoryField');
    if (campoNovaCategoria) {
        campoNovaCategoria.style.display = selecaoCategoria.value === 'Outros' ? 'block' : 'none';

        // Se estiver mostrando o campo, limpar o valor anterior e focar no input
        if (selecaoCategoria.value === 'Outros') {
            const inputNovaCategoria = document.getElementById('newCategoryName');
            if (inputNovaCategoria) {
                inputNovaCategoria.value = '';
                // Focar o campo após um pequeno delay para garantir que o campo esteja visível
                setTimeout(() => {
                    inputNovaCategoria.focus();
                }, 100);
            }
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    setupUserAccountActions();
    try {
        await carregarDados();
        exibirGastos();

        // Verificar se os elementos de nova categoria existem, caso contrário, criar
        // Criar campo para nova categoria no formulário principal se não existir
        if (!document.getElementById('newCategoryField')) {
            const categorySelect = document.getElementById('category');
            if (categorySelect) {
                const newCategoryField = document.createElement('div');
                newCategoryField.id = 'newCategoryField';
                newCategoryField.innerHTML = `
                    <label for="newCategoryName">Nome da nova categoria:</label>
                    <input type="text" id="newCategoryName" class="form-control" placeholder="Digite o nome da nova categoria">
                `;
                newCategoryField.style.display = 'none';
                categorySelect.parentNode.insertAdjacentElement('afterend', newCategoryField);
            }
        }

        // Criar campo para nova categoria no formulário de edição se não existir
        if (!document.getElementById('editNewCategoryField')) {
            const editCategorySelect = document.getElementById('editCategory');
            if (editCategorySelect) {
                const editNewCategoryField = document.createElement('div');
                editNewCategoryField.id = 'editNewCategoryField';
                editNewCategoryField.innerHTML = `
                    <label for="editNewCategoryName">Nome da nova categoria:</label>
                    <input type="text" id="editNewCategoryName" class="form-control" placeholder="Digite o nome da nova categoria">
                `;
                editNewCategoryField.style.display = 'none';
                editCategorySelect.parentNode.insertAdjacentElement('afterend', editNewCategoryField);
            }
        }

        // Eventos
        const formularioGasto = document.getElementById('expenseForm');
        if (formularioGasto) {
            formularioGasto.addEventListener('submit', adicionarGasto);
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

        // Eventos para campos de nova categoria
        const categorySelect = document.getElementById('category');
        const editCategorySelect = document.getElementById('editCategory');

        if (categorySelect) {
            categorySelect.addEventListener('change', alternarCampoNovaCategoria);
        }

        if (editCategorySelect) {
            editCategorySelect.addEventListener('change', alternarCampoNovaCategoriaEdicao);
        }

        if (formularioEdicaoGasto) {
            formularioEdicaoGasto.addEventListener('submit', salvarEdicaoGasto);
        }

        // Expor funções necessárias globalmente
        window.abrirModalEdicao = abrirModalEdicao;
        window.excluirGasto = excluirGasto;
        window.fecharModalEdicao = fecharModalEdicao;
    } catch (error) {
        console.error("Erro na inicialização:", error);
        Swal.fire({
            title: 'Erro na inicialização',
            text: 'Ocorreu um erro ao inicializar a página. Por favor, recarregue.',
            icon: 'error',
            confirmButtonText: 'Recarregar',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    }
});