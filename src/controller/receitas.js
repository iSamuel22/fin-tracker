import { Receita } from "../model/Receita.js";
import { CategoriaReceita } from "../model/CategoriaReceita.js";
import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
import { inicializarResponsividadeTabelas } from '../utils/tableResponsive.js';

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

let receitas = [];
let categorias = ['Salário', 'Investimentos', 'Freelance', 'Presentes'];

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
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // mês começa do zero
    const dia = String(dataObj.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

// função para normalizar data para comparação (remove o componente de tempo)
function normalizarDataParaComparacao(data) {
    const dataObj = garantirDataValida(data);
    return new Date(dataObj.getFullYear(), dataObj.getMonth(), dataObj.getDate());
}

// salva receitas no localStorage
function salvarReceitasLocalStorage() {
    const user = Auth.getLoggedInUser();
    if (user) {
        const receitasParaSalvar = receitas.map(r => ({
            id: r.id,
            descricao: r.descricao,
            valor: r.valor,
            // garante que a data seja salva como string ISO
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
                        // garante conversão correta da data
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

        // filtra documentos que não são de inicialização do sistema
        receitas = receitasData
            .filter(data => !data.isSystemGenerated)
            .map(data => {
                // correção na conversão de datas
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
        atualizarFilterCategorias();
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
            exibirReceitas(); // ssso vai mostrar "Nenhuma receita adicionada ainda."
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

// função para atualizar o select de categorias do filtro
function atualizarFilterCategorias() {
    const filterCategorySelect = document.getElementById('filterCategory');
    if (!filterCategorySelect) return;

    // preserva valor selecionado
    const valorAtual = filterCategorySelect.value;

    // limpa opções existentes, exceto a primeira (todas)
    while (filterCategorySelect.options.length > 1) {
        filterCategorySelect.remove(1);
    }

    // add categorias ao select de filtro (incluindo 'Outros')
    const todasCategorias = [...new Set([...categorias, 'Outros'])];

    todasCategorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        filterCategorySelect.appendChild(option);
    });

    // restaura valor anterior
    if (valorAtual && filterCategorySelect.querySelector(`option[value="${valorAtual}"]`)) {
        filterCategorySelect.value = valorAtual;
    }
}

// exibe as receitas na lista
function exibirReceitas() {
    const listaReceitas = document.getElementById('expensesList');

    if (!listaReceitas) {
        console.error("Elemento 'expensesList' não encontrado no DOM!");
        return;
    }

    listaReceitas.innerHTML = '';

    // aplica filtros
    let receitasFiltradas = receitas;

    // filtra por texto (descrição)
    if (filtros.texto) {
        const termoFiltro = filtros.texto.toLowerCase().trim();
        receitasFiltradas = receitasFiltradas.filter(receita =>
            receita.descricao.toLowerCase().includes(termoFiltro)
        );
    }

    // filtra por data de início - usando normalização da data para comparação
    if (filtros.dataInicio) {
        const dataInicioNormalizada = normalizarDataParaComparacao(filtros.dataInicio);
        receitasFiltradas = receitasFiltradas.filter(receita => {
            const dataReceitaNormalizada = normalizarDataParaComparacao(receita.data);
            return dataReceitaNormalizada >= dataInicioNormalizada;
        });
    }

    // filtra por data de fim - usando normalização da data para comparação
    if (filtros.dataFim) {
        const dataFimNormalizada = normalizarDataParaComparacao(filtros.dataFim);
        receitasFiltradas = receitasFiltradas.filter(receita => {
            const dataReceitaNormalizada = normalizarDataParaComparacao(receita.data);
            return dataReceitaNormalizada <= dataFimNormalizada;
        });
    }

    // filtra por categoria
    if (filtros.categoria) {
        receitasFiltradas = receitasFiltradas.filter(receita =>
            receita.categoria === filtros.categoria
        );
    }

    if (receitasFiltradas.length === 0) {
        if (temFiltrosAtivos()) {
            listaReceitas.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-filter me-2"></i>
                    Nenhuma receita encontrada para os filtros aplicados.
                    <button class="btn btn-link p-0 ms-2" onclick="window.limparTodosFiltros()">Limpar filtros</button>
                </div>
            `;
        } else {
            listaReceitas.innerHTML = '<div class="alert alert-info">Nenhuma receita adicionada ainda.</div>';
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
                    <strong>${receitasFiltradas.length}</strong> ${receitasFiltradas.length === 1 ? 'receita encontrada' : 'receitas encontradas'} 
                    para os filtros aplicados.
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="window.limparTodosFiltros()">
                    Limpar filtros
                </button>
            </div>
        `;
        listaReceitas.appendChild(filtroInfo);
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
    const receitasOrdenadas = [...receitasFiltradas].sort((a, b) => new Date(b.data) - new Date(a.data));

    receitasOrdenadas.forEach((receita) => {
        const tr = document.createElement('tr');

        // garante que a data seja válida antes de formatar
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

    // responsividade da tabela
    inicializarResponsividadeTabelas();
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
                atualizarFilterCategorias();
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

    // correção para garantir que a data seja formatada corretamente para o input
    const dataObj = garantirDataValida(receita.data);
    const dataFormatada = formatarDataParaInput(dataObj);
    console.log(`Data original: ${receita.data}, Data formatada para input: ${dataFormatada}`);
    
    // se o input de data está dentro de um grupo personalizado criado por melhorarInputsData()
    const dateInputGroup = document.querySelector('#editExpenseForm .date-input-group');
    if (dateInputGroup) {
        // encontra o input real dentro do grupo
        const realInput = dateInputGroup.querySelector('input[type="date"]');
        if (realInput) {
            realInput.value = dataFormatada;
        }
    } else {
        // se não foi transformado, usa o input direto
        inputDataEdicao.value = dataFormatada;
    }

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

        // validações existentes para categoria...

        Swal.fire({
            title: 'Atualizando...',
            text: 'Aguarde enquanto atualizamos sua receita',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // encontra o valor real da data, considerando a possibilidade de estar em um grupo personalizado
        let valorData;
        const dateInputGroup = document.querySelector('#editExpenseForm .date-input-group');
        if (dateInputGroup) {
            const realInput = dateInputGroup.querySelector('input[type="date"]');
            valorData = realInput ? realInput.value : inputDataEdicao.value;
        } else {
            valorData = inputDataEdicao.value;
        }

        // cria data corretamente a partir do valor no formato YYYY-MM-DD
        let dataSelecionada;
        if (valorData) {
            const [ano, mes, dia] = valorData.split('-').map(Number);
            dataSelecionada = new Date(ano, mes - 1, dia); // mês em JS é 0-indexed
        } else {
            dataSelecionada = new Date();
        }

        // cria nova instância de receita com a data corrigida
        const receita = new Receita(
            inputDescricaoEdicao.value,
            parseFloat(inputValorEdicao.value),
            dataSelecionada,
            categoria
        );

        // obtém o ID do firestore da receita atual
        const receitaAtual = receitas[indiceReceitaAtual];
        receita.id = receitaAtual.id;

        // log para verificar a data que está sendo enviada
        console.log("Data a ser salva:", receita.data);

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

// função para configurar eventos dos filtros
function setupFilters() {
    // botão e cabeçalho para mostrar/esconder filtros
    const btnToggleFilter = document.querySelector('.btn-toggle-filter');
    const filterCardHeader = document.querySelector('.filter-container .card-header');
    const filterCollapse = document.getElementById('filterCollapse');

    const bsCollapse = new bootstrap.Collapse(filterCollapse, {
        toggle: false
    });

    if (filterCardHeader) {
        filterCardHeader.style.cursor = 'pointer';
        filterCardHeader.addEventListener('click', (e) => {
            // evita que o clique no botão da seta acione este evento duas vezes
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

    // popula select de categorias com as categorias disponíveis
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

    // atualiza o badge de filtros
    atualizarBadgeFiltros();

    // aplica os filtros imediatamente ao limpar um filtro
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

    // aplica os filtros (agora limpos)
    aplicarFiltros();
}

// função para aplicar os filtros
function aplicarFiltros() {
    // coleta valores dos campos de filtro
    filtros.texto = document.getElementById('filterText').value.toLowerCase().trim();

    const startDateValue = document.getElementById('filterStartDate').value;
    filtros.dataInicio = startDateValue ? new Date(startDateValue) : null;

    const endDateValue = document.getElementById('filterEndDate').value;
    filtros.dataFim = endDateValue ? new Date(endDateValue) : null;

    filtros.categoria = document.getElementById('filterCategory').value;

    // exibe receitas filtradas
    exibirReceitas();
}

// converte inputs de data sem atraso visual
function melhorarInputsData() {
    // insere css inicial para resolver o problema de visibilidade
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* oculta inputs originais antes da substituição */
        #expenseForm input[type="date"], #editExpenseForm input[type="date"] {
            opacity: 0;
            position: absolute;
        }
        
        /* estiliza a versão personalizada */
        .date-input-group {
            opacity: 1;
            position: relative;
            display: flex;
            flex-wrap: nowrap;
        }
        
        /* garante que os inputs dentro dos grupos sejam visíveis */
        .date-input-group input[type="date"] {
            opacity: 1 !important;
            position: relative !important;
        }
    `;
    document.head.appendChild(styleEl);
    
    // seleciona todos os inputs de data dos formulários principais
    const dateInputs = document.querySelectorAll('#expenseForm input[type="date"], #editExpenseForm input[type="date"]');

    dateInputs.forEach(input => {
        // preserva o ID, classes e outros atributos importantes
        const id = input.id;
        const name = input.name || '';
        const required = input.required;
        const value = input.value;
        const parentElement = input.parentElement;

        // cria container para o novo input
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group date-input-group';

        // cria o ícone
        const iconSpan = document.createElement('span');
        iconSpan.className = 'input-group-text';
        iconSpan.innerHTML = '<i class="fas fa-calendar-alt fa-lg"></i>';

        // cria o novo input com as mesmas propriedades
        const newInput = document.createElement('input');
        newInput.type = 'date';
        newInput.id = id;
        newInput.name = name;
        newInput.className = 'form-control';
        newInput.required = required;
        if (value) newInput.value = value;

        // add comportamento específico para controlar melhor o calendário
        newInput.addEventListener('click', function (e) {
            // evita que o clique se propague para o documento
            e.stopPropagation();
        });

        // melhora o tratamento de blur e clique para dispositivos móveis também
        newInput.addEventListener('blur', function () {
            // força blur múltiplas vezes para garantir que o calendário feche
            this.blur();
            setTimeout(() => {
                this.blur();
            }, 50);
            setTimeout(() => {
                this.blur();
            }, 150);
        });

        // constrói a estrutura
        inputGroup.appendChild(iconSpan);
        inputGroup.appendChild(newInput);

        // subtitui o input original pelo grupo personalizado
        parentElement.replaceChild(inputGroup, input);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // aplica melhoria de campos de data imediatamente, antes de qualquer outra operação
    melhorarInputsData();
    
    // continua com o resto da inicialização
    inicializarAplicacao();
});

// função auxiliar para encapsular o resto do código de inicialização
async function inicializarAplicacao() {
    try {
        await carregarDados();

        // configura filtros
        setupFilters();

        exibirReceitas();
        
        // inicializa responsividade de tabelas
        inicializarResponsividadeTabelas();

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

        // expõe funções necessárias globalmente
        window.abrirModalEdicao = abrirModalEdicao;
        window.excluirReceita = excluirReceita;
        window.fecharModalEdicao = fecharModalEdicao;
        window.limparTodosFiltros = limparTodosFiltros; // expõe para uso no HTML
        window.limparFiltro = limparFiltro; // expõe para uso no HTML
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
}