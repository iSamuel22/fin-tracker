import { Auth } from "../services/Auth.js";

// verifica autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
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

    return valorAbreviado;
}

// formata data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// obtém dados do localStorage
function obterDados() {
    const user = Auth.getLoggedInUser();
    const gastos = JSON.parse(localStorage.getItem(`gastos_${user.email}`)) || [];
    const receitas = JSON.parse(localStorage.getItem(`receitas_${user.email}`)) || [];
    return { gastos, receitas };
}

// filtra dados por período
function filtrarDadosPorPeriodo(dados, dataInicio, dataFim) {
    // opção para não aplicar filtro de data
    if (!dataInicio || !dataFim) {
        return dados;
    }

    return dados.filter(item => {
        const data = new Date(item.data);
        return data >= dataInicio && data <= dataFim;
    });
}

// calcula totais do período
function calcularTotaisPeriodo(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();

    // se não houver restrição de datas, usar todos os dados
    const useAllData = !dataInicio || !dataFim;

    // se usar todos os dados, não filtrar
    const gastosFiltrados = useAllData ? gastos : filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);
    const receitasFiltradas = useAllData ? receitas : filtrarDadosPorPeriodo(receitas, dataInicio, dataFim);

    const totalGastos = gastosFiltrados.reduce((total, gasto) => total + parseFloat(gasto.valor), 0);
    const totalReceitas = receitasFiltradas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    const saldo = totalReceitas - totalGastos;

    // calcula economia média mensal
    // se não tiver período definido, considerar a média simples
    let economiaMedia;
    if (useAllData || dataInicio >= dataFim) {
        economiaMedia = saldo;
    } else {
        const meses = Math.max(1, Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24 * 30)));
        economiaMedia = saldo / meses;
    }

    // atualiza elementos html
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('totalReceitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);
    document.getElementById('economiaMedia').textContent = formatarMoeda(economiaMedia);

    return { totalGastos, totalReceitas, saldo, economiaMedia, gastosFiltrados, receitasFiltradas };
}

let evolucaoFinanceiraChart;
let topCategoriasChart;
let tendenciasChart;
let comparativoMensalChart;

// cria gráfico de evolução financeira
function criarGraficoEvolucaoFinanceira(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const ctx = document.getElementById('evolucaoFinanceiraChart').getContext('2d');

    // determinar se devemos usar todas as datas
    const useAllData = !dataInicio || !dataFim;

    // definir o intervalo de datas
    let datas = [];

    if (useAllData) {
        // se não há restrição de datas, encontrar a data mais antiga e a mais recente
        const todasDatas = [...gastos, ...receitas].map(item => new Date(item.data));
        if (todasDatas.length > 0) {
            const dataMinima = new Date(Math.min(...todasDatas));
            const dataMaxima = new Date(Math.max(...todasDatas));

            // ajustar para garantir um período razoável
            const umAnoAtras = new Date();
            umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

            // usar o que for mais recente: data mínima ou um ano atrás
            const dataInicial = dataMinima < umAnoAtras ? umAnoAtras : dataMinima;

            // criar array de datas
            let dataAtual = new Date(dataInicial);
            while (dataAtual <= dataMaxima) {
                datas.push(new Date(dataAtual));
                dataAtual.setDate(dataAtual.getDate() + 7); // incrementar por semana para reduzir pontos
            }
        }
    } else {
        // usar o período especificado
        let dataAtual = new Date(dataInicio);
        while (dataAtual <= dataFim) {
            datas.push(new Date(dataAtual));

            // incremento depende do tamanho do intervalo
            const diasNoIntervalo = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
            if (diasNoIntervalo > 60) {
                dataAtual.setDate(dataAtual.getDate() + 7); // semanal para períodos longos
            } else {
                dataAtual.setDate(dataAtual.getDate() + 1); // diário para períodos curtos
            }
        }
    }

    // adicionar mensagem informativa se não houver restrição de data
    const infoElement = document.getElementById('data-info');
    if (infoElement) {
        if (useAllData) {
            infoElement.textContent = "Mostrando todos os dados disponíveis sem restrição de data.";
            infoElement.style.display = "block";
        } else {
            infoElement.style.display = "none";
        }
    } else if (useAllData) {
        // criar o elemento de info se não existir
        const newInfoElement = document.createElement('div');
        newInfoElement.id = 'data-info';
        newInfoElement.className = 'alert alert-info';
        newInfoElement.textContent = "Mostrando todos os dados disponíveis sem restrição de data.";

        // inserir antes do primeiro gráfico
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.parentNode.insertBefore(newInfoElement, chartContainer);
        }
    }

    // calcular saldo acumulado para cada data
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

    // formatar datas de acordo com o período
    const formatarLabel = (data) => {
        if (datas.length > 30) {
            return data.toLocaleString('pt-BR', { day: '2-digit', month: 'short' });
        }
        return data.toLocaleDateString('pt-BR');
    };

    evolucaoFinanceiraChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datas.map(formatarLabel),
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
                    beginAtZero: false, // permitir valores negativos
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

// cria gráfico de top categorias
function criarGraficoTopCategorias(dataInicio, dataFim) {
    const { gastos } = obterDados();

    // determinar se devemos usar todas as datas
    const useAllData = !dataInicio || !dataFim;

    const gastosFiltrados = useAllData ? gastos : filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);

    // agrupa por categoria
    const categorias = {};
    gastosFiltrados.forEach(gasto => {
        if (!categorias[gasto.categoria]) {
            categorias[gasto.categoria] = 0;
        }
        categorias[gasto.categoria] += parseFloat(gasto.valor);
    });

    // ordena categorias por valor
    const categoriasOrdenadas = Object.entries(categorias)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // top 5 categorias

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

// cria gráfico de tendências
function criarGraficoTendencias(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const ctx = document.getElementById('tendenciasChart').getContext('2d');

    // determinar se devemos usar todas as datas
    const useAllData = !dataInicio || !dataFim;

    // filtrar dados se necessário
    const gastosFiltrados = useAllData ? gastos : filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);
    const receitasFiltradas = useAllData ? receitas : filtrarDadosPorPeriodo(receitas, dataInicio, dataFim);

    // agrupa por mês
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

    agruparPorMes(gastosFiltrados, 'gastos');
    agruparPorMes(receitasFiltradas, 'receitas');

    // ordena meses
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

// cria gráfico comparativo mensal
function criarGraficoComparativoMensal(dataInicio, dataFim) {
    const { gastos } = obterDados();
    const ctx = document.getElementById('comparativoMensalChart').getContext('2d');

    // determinar se devemos usar todas as datas
    const useAllData = !dataInicio || !dataFim;

    // filtrar dados se necessário
    const gastosFiltrados = useAllData ? gastos : filtrarDadosPorPeriodo(gastos, dataInicio, dataFim);

    // agrupa gastos por categoria e mês
    const dadosPorCategoria = {};
    gastosFiltrados.forEach(gasto => {
        const data = new Date(gasto.data);
        const mes = data.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });

        if (!dadosPorCategoria[gasto.categoria]) {
            dadosPorCategoria[gasto.categoria] = {};
        }

        if (!dadosPorCategoria[gasto.categoria][mes]) {
            dadosPorCategoria[gasto.categoria][mes] = 0;
        }

        dadosPorCategoria[gasto.categoria][mes] += parseFloat(gasto.valor);
    });

    // prepara dados para o gráfico
    const categorias = Object.keys(dadosPorCategoria);

    // usar meses únicos e ordená-los
    const mesesSet = new Set();
    gastosFiltrados.forEach(g => {
        const data = new Date(g.data);
        mesesSet.add(`${data.getFullYear()}-${data.getMonth()}`);
    });

    // ordenar os meses cronologicamente
    const mesesOrdenados = Array.from(mesesSet)
        .sort()
        .map(mesKey => {
            const [ano, mes] = mesKey.split('-');
            return new Date(parseInt(ano), parseInt(mes)).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        });

    if (comparativoMensalChart) {
        comparativoMensalChart.destroy();
    }

    comparativoMensalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mesesOrdenados,
            datasets: categorias.map((categoria, index) => ({
                label: categoria,
                data: mesesOrdenados.map(mes => dadosPorCategoria[categoria][mes] || 0),
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

// atualiza tabela de transações
function atualizarTabelaTransacoes(dataInicio, dataFim) {
    const { gastos, receitas } = obterDados();
    const tbody = document.getElementById('tabelaTransacoes');

    // determinar se devemos usar todas as datas
    const useAllData = !dataInicio || !dataFim;

    // combina e ordena transações
    const transacoes = [
        ...gastos.map(g => ({ ...g, tipo: 'Gasto' })),
        ...receitas.map(r => ({ ...r, tipo: 'Receita' }))
    ];

    // filtrar se necessário
    const transacoesFiltradas = useAllData
        ? transacoes
        : transacoes.filter(t => {
            const data = new Date(t.data);
            return data >= dataInicio && data <= dataFim;
        });

    // ordenar por data (mais recente primeiro)
    transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));

    // limpar a tabela
    tbody.innerHTML = '';

    // preenche tabela
    transacoesFiltradas.forEach(transacao => {
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

    // se a tabela estiver vazia, mostrar mensagem
    if (transacoesFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="5" class="text-center">Nenhuma transação encontrada${useAllData ? '' : ' no período selecionado'}.</td>
        `;
        tbody.appendChild(tr);
    }
}

// função para atualizar todos os relatórios
function atualizarRelatorios() {
    const periodoSelect = document.getElementById('periodoSelect');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');

    // opção para remover restrição de data
    if (periodoSelect.value === 'semrestrição') {
        dataInicio.disabled = true;
        dataFim.disabled = true;

        // chamar funções sem passar datas (null)
        calcularTotaisPeriodo(null, null);
        criarGraficoEvolucaoFinanceira(null, null);
        criarGraficoTopCategorias(null, null);
        criarGraficoTendencias(null, null);
        criarGraficoComparativoMensal(null, null);
        atualizarTabelaTransacoes(null, null);

        return;
    }

    // se período personalizado não estiver selecionado, calcular datas
    if (periodoSelect.value !== 'personalizado') {
        const dias = parseInt(periodoSelect.value);
        const hoje = new Date();

        const futuro = new Date();
        futuro.setDate(hoje.getDate() + 365); // válido para 1 ano
        dataFim.valueAsDate = futuro;
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
    // substitui o getitem e setitem padrão do localstorage para interceptar mudanças
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

    // configura a atualização automática
    configurarAtualizacaoAutomatica();

    const periodoSelect = document.getElementById('periodoSelect');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');

    // adicionar opção "sem restrição de data"
    const semRestricaoOption = document.createElement('option');
    semRestricaoOption.value = 'semrestrição';
    semRestricaoOption.textContent = 'Todos os dados (sem restrição de data)';
    periodoSelect.insertBefore(semRestricaoOption, periodoSelect.firstChild);

    // configurar data inicial como hoje menos 180 dias (6 meses)
    const hoje = new Date();
    // adicionar alguns dias para incluir transações futuras (ex: +30 dias)
    const futuro = new Date();
    futuro.setDate(hoje.getDate() + 365);
    dataFim.valueAsDate = futuro;
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 180);
    dataInicio.valueAsDate = inicio;

    // eventos
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

    // selecionar a opção "sem restrição de data" por padrão
    periodoSelect.value = 'semrestrição';

    // inicializa relatórios
    atualizarRelatorios();

    // atualizar a cada minuto para garantir dados atualizados
    setInterval(atualizarRelatorios, 60000);
});