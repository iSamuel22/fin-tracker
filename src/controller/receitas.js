import { Receita } from "../model/Receita.js";
import { CategoriaReceita } from "../model/CategoriaReceita.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

let receitas = [];
let categorias = ['Salário', 'Investimentos', 'Freelance', 'Presentes'];

// função aprimorada para garantir que uma data seja válida e considerar o fuso horário
function garantirDataValida(data) {
    if (!data) return new Date();

    // se for string de data ISO, converter para Date com ajuste de fuso horário
    if (typeof data === 'string') {
        const d = new Date(data);
        // Adicionar offset do fuso horário para garantir que a data exibida seja a mesma que foi inserida
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    }

    // se for timestamp do Firebase
    if (data && typeof data === 'object' && data.toDate) {
        return data.toDate();
    }

    // se já for um objeto Date válido
    if (data instanceof Date && !isNaN(data)) {
        return data;
    }

    // fallback para data atual
    return new Date();
}

// função aprimorada para formatar data para o input date no formato esperado (YYYY-MM-DD)
function formatarDataParaInput(data) {
    const dataObj = garantirDataValida(data);

    // usa formatação manual para garantir que não haja problemas com fuso horário
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
    const dia = String(dataObj.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

// menu user
function setupUserAccountActions() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Logout button clicked");
            try {
                // verifica se temos o usuário antes de sair
                const user = Auth.getLoggedInUser();
                console.log("Current user before logout:", user);

                localStorage.removeItem('loggedInUser');
                console.log("Removed user from localStorage");

                console.log("Redirecting to login page...");
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                Swal.fire({
                    title: 'Erro ao sair',
                    text: 'Ocorreu um erro ao sair da conta: ' + (error.message || 'Tente novamente mais tarde'),
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
        console.log("Logout button event listener added");
    } else {
        console.error("Logout button not found in the DOM");
    }

    // exclui conta
    const deleteAccountButton = document.getElementById('delete-account-button');
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            showDeleteAccountConfirmation();
        });
    }
}

// mostra confirmação antes de excluir a conta
function showDeleteAccountConfirmation() {
    // cria modal de confirmação
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

    // event listeners para botões do modal
    document.getElementById('close-delete-modal').addEventListener('click', () => {
        closeDeleteModal(modal);
    });

    document.getElementById('cancel-delete-account').addEventListener('click', () => {
        closeDeleteModal(modal);
    });

    document.getElementById('confirm-delete-account').addEventListener('click', async () => {
        try {
            const confirmButton = document.getElementById('confirm-delete-account');
            const originalText = confirmButton.innerHTML;
            confirmButton.disabled = true;
            confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';

            // deleta conta do usuário
            await deleteUserAccount();

            Swal.fire({
                title: 'Conta Excluída',
                text: 'Sua conta foi excluída com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            Swal.fire({
                title: 'Erro ao excluir conta',
                text: 'Ocorreu um erro ao excluir sua conta: ' + (error.message || 'Tente novamente mais tarde'),
                icon: 'error',
                confirmButtonText: 'OK'
            });

            const confirmButton = document.getElementById('confirm-delete-account');
            confirmButton.disabled = false;
            confirmButton.innerHTML = originalText;
        } finally {
            closeDeleteModal(modal);
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

// clear no localStorage
function cleanupLocalStorage(userEmail) {
    if (!userEmail) return;

    const prefixes = ['gastos_', 'receitas_', 'metas_', 'configuracoes_'];

    prefixes.forEach(prefix => {
        localStorage.removeItem(`${prefix}${userEmail}`);
    });

    localStorage.removeItem('loggedInUser');
}

// salva receitas no localStorage
function salvarReceitasLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const receitasParaSalvar = receitas.map(r => ({
            id: r.id,
            descricao: r.descricao,
            valor: r.valor,
            // Garantir que a data seja salva como string ISO
            data: garantirDataValida(r.data).toISOString(),
            categoria: r.categoria
        }));
        localStorage.setItem(`receitas_${user.email}`, JSON.stringify(receitasParaSalvar));
        console.log("Receitas salvas no localStorage:", receitasParaSalvar.length);
    }
}

// carrega receitas do localStorage
function carregarReceitasLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const receitasStorage = localStorage.getItem(`receitas_${user.email}`);
        if (receitasStorage) {
            try {
                const receitasData = JSON.parse(receitasStorage);
                receitas = receitasData.map(data => {
                    const receita = new Receita(
                        data.descricao,
                        parseFloat(data.valor),
                        // Garantir conversão correta da data
                        garantirDataValida(data.data),
                        data.categoria
                    );
                    receita.id = data.id;
                    return receita;
                });
                console.log("Receitas carregadas do localStorage:", receitas.length);
                return true;
            } catch (e) {
                console.error("Erro ao carregar receitas do localStorage:", e);
            }
        }
    }
    return false;
}

// carrega receitas e categorias do Firestore
async function carregarDados() {
    try {
        console.log("Iniciando carregamento de dados...");
        const user = Auth.getLoggedInUser();
        if (!user) {
            console.error("Usuário não autenticado ou não encontrado");
            window.location.href = 'login.html';
            return;
        }

        // primeiro carregar categorias do localStorage
        const categoriasReceitasStorage = localStorage.getItem(`categorias_receitas_${user.email}`);
        if (categoriasReceitasStorage) {
            categorias = JSON.parse(categoriasReceitasStorage);
            console.log("Categorias carregadas do localStorage:", categorias);
        }

        // depois carregar receitas do localStorage para exibição rápida
        const dadosCarregadosDoLocal = carregarReceitasLocalStorage();

        if (dadosCarregadosDoLocal) {
            console.log("Exibindo dados do localStorage enquanto carrega do Firestore");
            // atualiza a interface com os dados do localStorage
            atualizarSelectCategorias();
            exibirReceitas();
            // dispara evento para atualizar relatórios
            notificarAlteracoesDados();
        }

        // inicializa coleções e carregar dados do Firestore
        await FirestoreService.inicializarColecoes();
        const receitasData = await FirestoreService.getReceitas();

        console.log("Receitas carregadas do Firestore:", receitasData);

        // fiktra documentos que não são de inicialização do sistema
        receitas = receitasData
            .filter(data => !data.isSystemGenerated)
            .map(data => {
                // Correção na conversão de datas
                const data_formatada = garantirDataValida(data.data);

                // cria nova instância de Receita com ID do Firestore
                const receita = new Receita(
                    data.descricao,
                    parseFloat(data.valor),
                    data_formatada,
                    data.categoria
                );
                receita.id = data.id; // armazena o ID do Firestore
                return receita;
            });

        // extrai categorias únicas das receitas para atualizar a lista
        const categoriasFromReceitas = [...new Set(receitas.map(r => r.categoria))];
        categoriasFromReceitas.forEach(cat => {
            if (!categorias.includes(cat) && cat) {
                categorias.push(cat);
            }
        });

        // salva os dados atualizados no localStorage
        salvarReceitasLocalStorage();
        salvarCategorias();

        // atualiza a interface
        atualizarSelectCategorias();
        exibirReceitas();

        notificarAlteracoesDados();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);

        // verifica se é realmente um erro ou apenas falta de dados
        const isNetworkError = error instanceof TypeError && error.message.includes('network');
        const isPermissionError = error.code === 'permission-denied';
        const isAuthError = error.code === 'unauthenticated';

        // para usuários novos ou sem dados, não mostrar erro
        if (isNetworkError || isPermissionError || isAuthError) {
            // mostra erro apenas para problemas reais de conexão ou permissão
            Swal.fire({
                title: 'Erro ao carregar dados',
                text: 'Ocorreu um erro de conexão. Por favor, verifique sua internet e tente novamente.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } else {
            // para outros casos (incluindo quando não há dados), apenas exibir a interface vazia
            console.log("Sem dados ou erro não crítico, exibindo interface vazia");
            exibirReceitas(); // Isso vai mostrar "Nenhuma receita adicionada ainda."
            notificarAlteracoesDados();
        }
    }
}

// salva apenas categorias no localStorage
function salvarCategorias() {
    const user = Auth.getLoggedInUser();
    if (user) {
        localStorage.setItem(`categorias_receitas_${user.email}`, JSON.stringify(categorias));
        console.log("Categorias salvas no localStorage:", categorias);
    }
}

// atualiza o select de categorias
function atualizarSelectCategorias() {
    const selects = [
        document.getElementById('category'),
        document.getElementById('editCategory')
    ];

    selects.forEach(select => {
        if (select) {
            // salva valor atual para preservar a seleção após a atualização
            const valorAtual = select.value;

            // limpa opções existentes
            select.innerHTML = '<option value="">Selecione</option>';

            // add categorias
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                select.appendChild(option);
            });

            // add opção "Outros"
            const outrosOption = document.createElement('option');
            outrosOption.value = 'Outros';
            outrosOption.textContent = 'Outros';
            select.appendChild(outrosOption);

            // restaura valor selecionado se existia anteriormente
            if (valorAtual && select.querySelector(`option[value="${valorAtual}"]`)) {
                select.value = valorAtual;
            }
        }
    });
}

// exibe as receitas na lista
function exibirReceitas() {
    const listaReceitas = document.getElementById('expensesList');

    if (!listaReceitas) {
        console.error("Elemento 'expensesList' não encontrado no DOM!");
        return;
    }

    listaReceitas.innerHTML = '';

    if (receitas.length === 0) {
        listaReceitas.innerHTML = '<div class="alert alert-info">Nenhuma receita adicionada ainda.</div>';
        return;
    }

    // cria tabela para exibir as receitas
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    // ordena receitas por data (mais recente primeiro)
    const receitasOrdenadas = [...receitas].sort((a, b) => new Date(b.data) - new Date(a.data));

    receitasOrdenadas.forEach((receita, index) => {
        const tr = document.createElement('tr');

        // Garantir que a data seja válida antes de formatar
        const dataFormatada = garantirDataValida(receita.data).toLocaleDateString();

        tr.innerHTML = `
            <td>${receita.descricao}</td>
            <td>R$ ${parseFloat(receita.valor).toFixed(2)}</td>
            <td>${receita.categoria}</td>
            <td>${dataFormatada}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="window.abrirModalEdicao('${receita.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="window.excluirReceita('${receita.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    listaReceitas.appendChild(table);
}

// add uma nova receita
async function adicionarReceita(evento) {
    evento.preventDefault();

    try {
        const descricaoInput = document.getElementById('description');
        const valorInput = document.getElementById('amount');
        const selecaoCategoria = document.getElementById('category');
        const dataInput = document.getElementById('date');

        let categoria = selecaoCategoria.value;

        // valida os campos
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

        // se a categoria for "Outros", pega o valor do campo de nova categoria
        if (categoria === 'Outros') {
            const novoNomeCategoria = document.getElementById('newCategoryName').value.trim();
            if (!novoNomeCategoria) {
                throw new Error('Por favor, insira o nome da nova categoria.');
            }

            // cria nova categoria
            const novaCategoria = new CategoriaReceita(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // add a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
            }
        }

        Swal.fire({
            title: 'Salvando...',
            text: 'Aguarde enquanto salvamos sua receita',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // cria nova instância de receita com ajuste para evitar problema de fuso horário
        const dataValor = dataInput.value;
        const dataSelecionada = new Date(dataValor);
        const dataCorrigida = new Date(dataSelecionada.getTime() + dataSelecionada.getTimezoneOffset() * 60000);

        const receita = new Receita(
            descricaoInput.value,
            parseFloat(valorInput.value),
            dataCorrigida,
            categoria
        );

        // salva no firestore
        const receitaData = {
            descricao: receita.descricao,
            valor: receita.valor,
            data: receita.data,
            categoria: receita.categoria
        };

        const novaReceita = await FirestoreService.addReceita(receitaData);
        receita.id = novaReceita.id;
        receitas.push(receita);
        salvarReceitasLocalStorage();

        Swal.close();

        // clear no formulário
        descricaoInput.value = '';
        valorInput.value = '';
        selecaoCategoria.value = '';
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryField').style.display = 'none';
        dataInput.value = '';

        Swal.fire({
            title: 'Sucesso!',
            text: 'Receita adicionada com sucesso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        exibirReceitas();
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
    document.dispatchEvent(new CustomEvent('dadosReceitasAtualizados'));
}

// ref. ao modal
const modalEdicao = document.getElementById('editModal');
const inputDescricaoEdicao = document.getElementById('editDescription');
const inputValorEdicao = document.getElementById('editAmount');
const selecaoCategoriaEdicao = document.getElementById('editCategory');
const inputDataEdicao = document.getElementById('editDate');
const formularioEdicaoReceita = document.getElementById('editExpenseForm');

let indiceReceitaAtual = -1;

// abre o modal de edição
function abrirModalEdicao(id) {
    const receitaIndex = receitas.findIndex(r => r.id === id);
    if (receitaIndex === -1) {
        console.error('Receita não encontrada');
        return;
    }

    indiceReceitaAtual = receitaIndex;
    const receita = receitas[receitaIndex];

    console.log(`Abrindo modal para edição da receita [${id}]:`, receita);

    inputDescricaoEdicao.value = receita.descricao;
    inputValorEdicao.value = receita.valor;

    // garante que o select está atualizado antes de definir o valor
    atualizarSelectCategorias();

    // define a categoria correta no select
    selecaoCategoriaEdicao.value = receita.categoria;

    // verifica se precisamos mostrar o campo de nova categoria
    alternarCampoNovaCategoriaEdicao();

    // usa a função formatarDataParaInput para garantir consistência
    const dataFormatada = formatarDataParaInput(receita.data);
    console.log(`Data original: ${receita.data}, Data formatada para input: ${dataFormatada}`);
    inputDataEdicao.value = dataFormatada;

    modalEdicao.style.display = "block";
}

// fecha o modal
function fecharModalEdicao() {
    modalEdicao.style.display = "none";
}

// alterna campo de nova categoria no modal de edição
function alternarCampoNovaCategoriaEdicao() {
    let campoNovaCategoria = document.getElementById('editNewCategoryField');

    // se o campo não existir, criá-lo dinamicamente
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

    // agora podemos verificar novamente e manipular o campo
    if (campoNovaCategoria) {
        campoNovaCategoria.style.display = selecaoCategoriaEdicao.value === 'Outros' ? 'block' : 'none';

        // se estiver mostrando o campo, limpar o valor anterior e focar no input
        if (selecaoCategoriaEdicao.value === 'Outros') {
            const inputNovaCategoria = document.getElementById('editNewCategoryName');
            if (inputNovaCategoria) {
                inputNovaCategoria.value = '';
                // foca o campo após um pequeno delay para garantir que o campo esteja visível
                setTimeout(() => {
                    inputNovaCategoria.focus();
                }, 100);
            }
        }
    }
}

// salva as alterações da receita
async function salvarEdicaoReceita(evento) {
    evento.preventDefault();

    try {
        let categoria = selecaoCategoriaEdicao.value;

        // se a categoria for "Outros", pega o valor do campo de nova categoria usando apenas o SweetAlert
        if (categoria === 'Outros') {
            // usando apenas o SweetAlert para obter o nome da nova categoria
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

            // cria nova categoria
            const novaCategoria = new CategoriaReceita(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // add a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
            }
        }

        Swal.fire({
            title: 'Atualizando...',
            text: 'Aguarde enquanto atualizamos sua receita',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Criar a data com ajuste de fuso horário
        const dataSelecionada = new Date(inputDataEdicao.value);
        const dataCorrigida = new Date(dataSelecionada.getTime() + dataSelecionada.getTimezoneOffset() * 60000);

        const receita = new Receita(
            inputDescricaoEdicao.value,
            parseFloat(inputValorEdicao.value),
            dataCorrigida,
            categoria
        );

        // obtém o ID do firestore da receita atual
        const receitaAtual = receitas[indiceReceitaAtual];
        receita.id = receitaAtual.id;

        // atualiza no firestore
        const receitaData = {
            descricao: receita.descricao,
            valor: receita.valor,
            data: receita.data,
            categoria: receita.categoria
        };

        await FirestoreService.updateReceita(receita.id, receitaData);
        receitas[indiceReceitaAtual] = receita;
        salvarReceitasLocalStorage();

        Swal.close();

        Swal.fire({
            title: 'Sucesso!',
            text: 'Receita atualizada com sucesso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        fecharModalEdicao();
        exibirReceitas();
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

// exclui uma receita existente
async function excluirReceita(id) {
    const receitaIndex = receitas.findIndex(r => r.id === id);
    if (receitaIndex === -1) {
        console.error('Receita não encontrada');
        return;
    }

    const confirmarExclusao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Você deseja excluir esta receita?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (confirmarExclusao.isConfirmed) {
        try {
            // mostra loader
            Swal.fire({
                title: 'Excluindo...',
                text: 'Aguarde enquanto excluímos sua receita',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const receita = receitas[receitaIndex];
            await FirestoreService.deleteReceita(receita.id);
            receitas.splice(receitaIndex, 1);
            salvarReceitasLocalStorage();

            // fecha o loader
            Swal.close();

            // msg de sucesso
            Swal.fire({
                title: 'Excluído!',
                text: 'Sua receita foi excluída com sucesso',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            exibirReceitas();
            notificarAlteracoesDados();
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao excluir a receita: ' + error.message,
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

        // se estiver mostrando o campo, limpar o valor anterior e focar no input
        if (selecaoCategoria.value === 'Outros') {
            const inputNovaCategoria = document.getElementById('newCategoryName');
            if (inputNovaCategoria) {
                inputNovaCategoria.value = '';
                // foca o campo após um pequeno delay para garantir que o campo esteja visível
                setTimeout(() => {
                    inputNovaCategoria.focus();
                }, 100);
            }
        }
    }
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

// inicialização
document.addEventListener('DOMContentLoaded', async () => {
    setupUserAccountActions();
    atualizarDadosUsuarioNoMenu();
    try {
        await carregarDados();
        exibirReceitas();

        // verifica se os elementos de nova categoria existem, caso contrário, cria
        // cria campo para nova categoria no formulário principal se não existir
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

        // cria campo para nova categoria no formulário de ediçãom, se não existir
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

        // eventos
        const formularioReceita = document.getElementById('expenseForm');
        if (formularioReceita) {
            formularioReceita.addEventListener('submit', adicionarReceita);
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

        // eventos para campos de nova categoria
        const categorySelect = document.getElementById('category');
        const editCategorySelect = document.getElementById('editCategory');

        if (categorySelect) {
            categorySelect.addEventListener('change', alternarCampoNovaCategoria);
        }

        if (editCategorySelect) {
            editCategorySelect.addEventListener('change', alternarCampoNovaCategoriaEdicao);
        }

        if (formularioEdicaoReceita) {
            formularioEdicaoReceita.addEventListener('submit', salvarEdicaoReceita);
        }

        // expor funções necessárias globalmente
        window.abrirModalEdicao = abrirModalEdicao;
        window.excluirReceita = excluirReceita;
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