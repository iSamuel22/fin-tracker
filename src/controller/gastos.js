import { Gasto } from "../model/Gasto.js";
import { CategoriaGasto } from "../model/CategoriaGasto.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

let gastos = [];
let categorias = ['Alimentação', 'Transporte', 'Lazer', 'Moradia'];

// variáveis para filtros
let filtros = {
    texto: '',
    dataInicio: null,
    dataFim: null,
    categoria: ''
};

// função aprimorada para garantir que uma data seja válida e considerar o fuso horário
function garantirDataValida(data) {
    if (!data) return new Date();

    // se for string de data ISO, converter para Date
    if (typeof data === 'string') {
        const d = new Date(data);
        if (!isNaN(d.getTime())) {
            return d;
        }
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

// função para normalizar data para comparação (remove o componente de tempo)
function normalizarDataParaComparacao(data) {
    const dataObj = garantirDataValida(data);
    return new Date(dataObj.getFullYear(), dataObj.getMonth(), dataObj.getDate());
}

// menu user
function setupUserAccountActions() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Logout button clicked");
            try {
                // verificar se temos o usuário antes de sair
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

            // deleta a conta do usuário
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
                title: 'Erro',
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

// clean no localStorage
function cleanupLocalStorage(userEmail) {
    if (!userEmail) return;

    const prefixes = ['gastos_', 'receitas_', 'metas_', 'configuracoes_'];

    prefixes.forEach(prefix => {
        localStorage.removeItem(`${prefix}${userEmail}`);
    });

    localStorage.removeItem('loggedInUser');
}

// salvar gastos no localStorage
function salvarGastosLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const gastosParaSalvar = gastos.map(g => ({
            id: g.id,
            descricao: g.descricao,
            valor: g.valor,
            // Garantir que a data seja salva como string ISO
            data: garantirDataValida(g.data).toISOString(),
            categoria: g.categoria
        }));
        localStorage.setItem(`gastos_${user.email}`, JSON.stringify(gastosParaSalvar));
        console.log("Gastos salvos no localStorage:", gastosParaSalvar.length);
    }
}

// carrega gastos do localStorage
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
                        // Garantir conversão correta da data
                        garantirDataValida(data.data),
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

// carregar gastos e categorias do firestore
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
        const categoriasGastosStorage = localStorage.getItem(`categorias_gastos_${user.email}`);
        if (categoriasGastosStorage) {
            categorias = JSON.parse(categoriasGastosStorage);
            console.log("Categorias carregadas do localStorage:", categorias);
        }

        // depois carregar gastos do localStorage para exibição rápida
        const dadosCarregadosDoLocal = carregarGastosLocalStorage();

        if (dadosCarregadosDoLocal) {
            console.log("Exibindo dados do localStorage enquanto carrega do Firestore");
            // atualiza a interface com os dados do localStorage
            atualizarSelectCategorias();
            exibirGastos();
            // dispara evento para atualizar relatórios
            notificarAlteracoesDados();
        }

        // inicializa coleções e carregar dados do Firestore
        await FirestoreService.inicializarColecoes();
        const gastosData = await FirestoreService.getGastos();

        console.log("Gastos carregados do Firestore:", gastosData);

        // filtra documentos que não são de inicialização do sistema
        gastos = gastosData
            .filter(data => !data.isSystemGenerated)
            .map(data => {
                // Correção na conversão de datas
                const data_formatada = garantirDataValida(data.data);

                // Cria nova instância de Gasto com ID do Firestore
                const gasto = new Gasto(
                    data.descricao,
                    parseFloat(data.valor),
                    data_formatada,
                    data.categoria
                );
                gasto.id = data.id;
                return gasto;
            });

        // extrai categorias únicas dos gastos para atualizar a lista
        const categoriasFromGastos = [...new Set(gastos.map(g => g.categoria))];
        categoriasFromGastos.forEach(cat => {
            if (!categorias.includes(cat) && cat) {
                categorias.push(cat);
            }
        });

        // salva os dados atualizados no localStorage
        salvarGastosLocalStorage();
        salvarCategorias();

        // atualiza a interface
        atualizarSelectCategorias();
        atualizarFilterCategorias();
        exibirGastos();

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
            exibirGastos(); // Isso vai mostrar "Nenhum gasto adicionado ainda."
            notificarAlteracoesDados();
        }
    }
}

// salva apenas categorias no localStorage
function salvarCategorias() {
    const user = Auth.getLoggedInUser();
    if (user) {
        localStorage.setItem(`categorias_gastos_${user.email}`, JSON.stringify(categorias));
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

// função para atualizar o select de categorias do filtro
function atualizarFilterCategorias() {
    const filterCategorySelect = document.getElementById('filterCategory');
    if (!filterCategorySelect) return;
    
    // preservar valor selecionado
    const valorAtual = filterCategorySelect.value;
    
    // limpar opções existentes, exceto a primeira (Todas)
    while (filterCategorySelect.options.length > 1) {
        filterCategorySelect.remove(1);
    }
    
    // adicionar categorias ao select de filtro (incluindo 'Outros')
    const todasCategorias = [...new Set([...categorias, 'Outros'])];
    
    todasCategorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        filterCategorySelect.appendChild(option);
    });
    
    // restaurar valor anterior
    if (valorAtual && filterCategorySelect.querySelector(`option[value="${valorAtual}"]`)) {
        filterCategorySelect.value = valorAtual;
    }
}

// exibe os gastos na lista
function exibirGastos() {
    const listaGastos = document.getElementById('expensesList');

    if (!listaGastos) {
        console.error("Elemento 'expensesList' não encontrado no DOM!");
        return;
    }

    listaGastos.innerHTML = '';

    // aplicar filtros
    let gastosFiltrados = gastos;
    
    // filtrar por texto (descrição)
    if (filtros.texto) {
        gastosFiltrados = gastosFiltrados.filter(gasto => 
            gasto.descricao.toLowerCase().includes(filtros.texto)
        );
    }
    
    // filtrar por data de início - usando normalização da data para comparação
    if (filtros.dataInicio) {
        const dataInicioNormalizada = normalizarDataParaComparacao(filtros.dataInicio);
        gastosFiltrados = gastosFiltrados.filter(gasto => {
            const dataGastoNormalizada = normalizarDataParaComparacao(gasto.data);
            return dataGastoNormalizada >= dataInicioNormalizada;
        });
    }
    
    // filtrar por data de fim - usando normalização da data para comparação
    if (filtros.dataFim) {
        const dataFimNormalizada = normalizarDataParaComparacao(filtros.dataFim);
        // Não precisamos mais ajustar para o fim do dia, pois estamos comparando apenas as datas
        gastosFiltrados = gastosFiltrados.filter(gasto => {
            const dataGastoNormalizada = normalizarDataParaComparacao(gasto.data);
            return dataGastoNormalizada <= dataFimNormalizada;
        });
    }
    
    // filtrar por categoria
    if (filtros.categoria) {
        gastosFiltrados = gastosFiltrados.filter(gasto => 
            gasto.categoria === filtros.categoria
        );
    }

    if (gastosFiltrados.length === 0) {
        if (temFiltrosAtivos()) {
            listaGastos.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-filter me-2"></i>
                    Nenhum gasto encontrado para os filtros aplicados.
                    <button class="btn btn-link p-0 ms-2" onclick="window.limparTodosFiltros()">Limpar filtros</button>
                </div>
            `;
        } else {
            listaGastos.innerHTML = '<div class="alert alert-info">Nenhum gasto adicionado ainda.</div>';
        }
        return;
    }

    // mostrar indicador de filtros ativos
    if (temFiltrosAtivos()) {
        const filtroInfo = document.createElement('div');
        filtroInfo.className = 'alert alert-info mb-3';
        filtroInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-filter me-2"></i>
                    <strong>${gastosFiltrados.length}</strong> ${gastosFiltrados.length === 1 ? 'gasto encontrado' : 'gastos encontrados'} 
                    para os filtros aplicados.
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="window.limparTodosFiltros()">
                    Limpar filtros
                </button>
            </div>
        `;
        listaGastos.appendChild(filtroInfo);
    }

    // cria tabela para exibir os gastos
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

    // ordena gastos por data (mais recente primeiro)
    const gastosOrdenados = [...gastosFiltrados].sort((a, b) => new Date(b.data) - new Date(a.data));

    gastosOrdenados.forEach((gasto) => {
        const tr = document.createElement('tr');

        // garante que a data seja válida antes de formatar
        const dataFormatada = garantirDataValida(gasto.data).toLocaleDateString();

        tr.innerHTML = `
            <td>${gasto.descricao}</td>
            <td>R$ ${parseFloat(gasto.valor).toFixed(2)}</td>
            <td>${gasto.categoria}</td>
            <td>${dataFormatada}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="window.abrirModalEdicao('${gasto.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="window.excluirGasto('${gasto.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    listaGastos.appendChild(table);
}

// função para verificar se há filtros ativos
function temFiltrosAtivos() {
    return (
        filtros.texto !== '' || 
        filtros.dataInicio !== null || 
        filtros.dataFim !== null || 
        filtros.categoria !== ''
    );
}

// função para contar quantos filtros estão ativos
function contarFiltrosAtivos() {
    let count = 0;
    if (filtros.texto) count++;
    if (filtros.dataInicio) count++;
    if (filtros.dataFim) count++;
    if (filtros.categoria) count++;
    return count;
}

// função para atualizar o badge de filtros ativos
function atualizarBadgeFiltros() {
    const filterCount = contarFiltrosAtivos();
    const cardHeader = document.querySelector('.filter-container .card-header');
    
    // Remove any existing badge
    const existingBadge = cardHeader.querySelector('.filter-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add badge if there are active filters
    if (filterCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.textContent = filterCount;
        cardHeader.appendChild(badge);
    }
}

// add um novo gasto
async function adicionarGasto(evento) {
    evento.preventDefault();

    try {
        const descricaoInput = document.getElementById('description');
        const valorInput = document.getElementById('amount');
        const selecaoCategoria = document.getElementById('category');
        const dataInput = document.getElementById('date');

        let categoria = selecaoCategoria.value;

        // validação dos campos
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
            const novaCategoria = new CategoriaGasto(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // add a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
                atualizarFilterCategorias(); // Adicionar esta linha
            }
        }

        Swal.fire({
            title: 'Salvando...',
            text: 'Aguarde enquanto salvamos seu gasto',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // cria nova instância de gasto com ajuste para evitar problema de fuso horário
        const dataValor = dataInput.value;
        const dataSelecionada = new Date(dataValor);
        const dataCorrigida = new Date(dataSelecionada.getTime() + dataSelecionada.getTimezoneOffset() * 60000);

        const gasto = new Gasto(
            descricaoInput.value,
            parseFloat(valorInput.value),
            dataCorrigida,
            categoria
        );

        // salva no Firestore
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

        Swal.close();

        // clean no formulário
        descricaoInput.value = '';
        valorInput.value = '';
        selecaoCategoria.value = '';
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryField').style.display = 'none';
        dataInput.value = '';

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

// ref. ao modal
const modalEdicao = document.getElementById('editModal');
const inputDescricaoEdicao = document.getElementById('editDescription');
const inputValorEdicao = document.getElementById('editAmount');
const selecaoCategoriaEdicao = document.getElementById('editCategory');
const inputDataEdicao = document.getElementById('editDate');
const formularioEdicaoGasto = document.getElementById('editExpenseForm');

let indiceGastoAtual = -1;

// abre o modal de edição
function abrirModalEdicao(id) {
    const gastoIndex = gastos.findIndex(g => g.id === id);
    if (gastoIndex === -1) {
        console.error('Gasto não encontrado');
        return;
    }

    indiceGastoAtual = gastoIndex;
    const gasto = gastos[gastoIndex];

    console.log(`Abrindo modal para edição do gasto [${id}]:`, gasto);

    inputDescricaoEdicao.value = gasto.descricao;
    inputValorEdicao.value = gasto.valor;

    // garante que o select está atualizado antes de definir o valor
    atualizarSelectCategorias();

    // define a categoria correta no select
    selecaoCategoriaEdicao.value = gasto.categoria;

    // verifica se precisamos mostrar o campo de nova categoria
    alternarCampoNovaCategoriaEdicao();

    // Usar a função formatarDataParaInput para garantir consistência
    const dataFormatada = formatarDataParaInput(gasto.data);
    console.log(`Data original: ${gasto.data}, Data formatada para input: ${dataFormatada}`);
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

// salva as alterações do gasto
async function salvarEdicaoGasto(evento) {
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
            const novaCategoria = new CategoriaGasto(novoNomeCategoria);
            categoria = novaCategoria.nome;

            // add a nova categoria à lista se não existir
            if (!categorias.includes(categoria)) {
                categorias.push(categoria);
                salvarCategorias();
                atualizarSelectCategorias();
                atualizarFilterCategorias(); // Adicionar esta linha
            }
        }

        Swal.fire({
            title: 'Atualizando...',
            text: 'Aguarde enquanto atualizamos seu gasto',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // cria a data com ajuste de fuso horário
        const dataSelecionada = new Date(inputDataEdicao.value);
        const dataCorrigida = new Date(dataSelecionada.getTime() + dataSelecionada.getTimezoneOffset() * 60000);

        const gasto = new Gasto(
            inputDescricaoEdicao.value,
            parseFloat(inputValorEdicao.value),
            dataCorrigida,
            categoria
        );

        // obtém o ID do firestore do gasto atual
        const gastoAtual = gastos[indiceGastoAtual];
        gasto.id = gastoAtual.id;

        // atualiza no firestore
        const gastoData = {
            descricao: gasto.descricao,
            valor: gasto.valor,
            data: gasto.data,
            categoria: gasto.categoria
        };

        await FirestoreService.updateGasto(gasto.id, gastoData);
        gastos[indiceGastoAtual] = gasto;
        salvarGastosLocalStorage();

        Swal.close();

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

// exclui um gasto existente
async function excluirGasto(id) {
    const gastoIndex = gastos.findIndex(g => g.id === id);
    if (gastoIndex === -1) {
        console.error('Gasto não encontrado');
        return;
    }

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
            // exibe loader
            Swal.fire({
                title: 'Excluindo...',
                text: 'Aguarde enquanto excluímos seu gasto',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const gasto = gastos[gastoIndex];
            await FirestoreService.deleteGasto(gasto.id);
            gastos.splice(gastoIndex, 1);
            salvarGastosLocalStorage();

            // fecha o loader
            Swal.close();

            // msg de sucesso
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

// função para configurar eventos dos filtros
function setupFilters() {
    // botão para mostrar/esconder filtros
    const btnToggleFilter = document.querySelector('.btn-toggle-filter');
    const filterCollapse = document.getElementById('filterCollapse');
    
    if (btnToggleFilter) {
        btnToggleFilter.addEventListener('click', () => {
            const isExpanded = btnToggleFilter.getAttribute('aria-expanded') === 'true';
            btnToggleFilter.setAttribute('aria-expanded', !isExpanded);
            btnToggleFilter.querySelector('i').classList.toggle('fa-chevron-down');
            btnToggleFilter.querySelector('i').classList.toggle('fa-chevron-up');
            
            if (filterCollapse) {
                filterCollapse.classList.toggle('show');
            }
        });
    }
    
    // popular select de categorias com as categorias disponíveis
    atualizarFilterCategorias();
    
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
    
    // aplicar filtros ao pressionar Enter no campo de texto
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
        case 'startDate':
            document.getElementById('filterStartDate').value = '';
            filtros.dataInicio = null;
            break;
        case 'endDate':
            document.getElementById('filterEndDate').value = '';
            filtros.dataFim = null;
            break;
        case 'category':
            document.getElementById('filterCategory').value = '';
            filtros.categoria = '';
            break;
    }
    
    // Atualizar o badge de filtros
    atualizarBadgeFiltros();
    
    // aplicar os filtros imediatamente ao limpar um filtro
    aplicarFiltros();
}

// função para limpar todos os filtros
function limparTodosFiltros() {
    document.getElementById('filterText').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterCategory').value = '';
    
    filtros = {
        texto: '',
        dataInicio: null,
        dataFim: null,
        categoria: ''
    };
    
    // Atualizar o badge de filtros
    atualizarBadgeFiltros();
    
    // aplicar os filtros (agora limpos)
    aplicarFiltros();
}

// função para aplicar os filtros
function aplicarFiltros() {
    // coletar valores dos campos de filtro
    filtros.texto = document.getElementById('filterText').value.toLowerCase().trim();
    
    const startDateValue = document.getElementById('filterStartDate').value;
    filtros.dataInicio = startDateValue ? new Date(startDateValue) : null;
    
    const endDateValue = document.getElementById('filterEndDate').value;
    filtros.dataFim = endDateValue ? new Date(endDateValue) : null;
    
    filtros.categoria = document.getElementById('filterCategory').value;
    
    // Atualizar o badge de filtros
    atualizarBadgeFiltros();
    
    // exibir gastos filtrados
    exibirGastos();
}

// atualiza as informações do usuário no menu
function atualizarDadosUsuarioNoMenu() {
    try {
        const user = Auth.getLoggedInUser();

        if (!user) {
            console.warn("Usuário não encontrado no localStorage");
            return;
        }

        //aAtualiza o nome do usuário na barra de navegação
        const userMenuName = document.querySelector('#userMenu span.d-none.d-md-inline');
        if (userMenuName) {
            userMenuName.textContent = user.name || 'Usuário';
        }

        // atualiza avatar com as iniciais do usuário real
        const userInitials = user.name ? encodeURIComponent(user.name) : 'Usuario';
        const avatarUrls = document.querySelectorAll('.user-avatar');
        avatarUrls.forEach(avatar => {
            avatar.src = `https://ui-avatars.com/api/?name=${userInitials}&background=4e73df&color=fff&rounded=true${avatar.width >= 64 ? '&size=64' : ''}`;
            avatar.alt = `Avatar de ${user.name || 'Usuário'}`;
        });

        // atualiza informações no dropdown
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

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    setupUserAccountActions();
    atualizarDadosUsuarioNoMenu();
    try {
        await carregarDados();
        
        // configurar filtros
        setupFilters();
        
        // inicializar o indicador de filtros
        atualizarBadgeFiltros();
        
        exibirGastos();

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

        // cria campo para nova categoria no formulário de edição se não existir
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

        // eventos para campos de nova categoria
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

        // expõe funções necessárias globalmente
        window.abrirModalEdicao = abrirModalEdicao;
        window.excluirGasto = excluirGasto;
        window.fecharModalEdicao = fecharModalEdicao;
        window.limparTodosFiltros = limparTodosFiltros; // expor para uso no HTML
        window.limparFiltro = limparFiltro; // expor para uso no HTML
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