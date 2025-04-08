document.addEventListener('DOMContentLoaded', function () {
    // cria os modais dinamicamente
    const modalsHTML = `
   <!-- Modal "Ajuda" -->
    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="helpModalLabel"><i class="fas fa-question-circle me-2"></i>Manual de Ajuda</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="overflow-auto mb-4">
                        <div class="help-nav d-flex justify-content-center">
                            <div class="nav nav-pills flex-nowrap" role="group" aria-label="Navegação de ajuda">
                                <button type="button" class="btn btn-outline-primary active flex-shrink-0" data-section="inicio">
                                    <i class="fas fa-home d-block d-md-none"></i>
                                    <span class="d-none d-md-inline">Início</span>
                                </button>
                                <button type="button" class="btn btn-outline-primary flex-shrink-0" data-section="transacoes">
                                    <i class="fas fa-exchange-alt d-block d-md-none"></i>
                                    <span class="d-none d-md-inline">Transações</span>
                                </button>
                                <button type="button" class="btn btn-outline-primary flex-shrink-0" data-section="metas">
                                    <i class="fas fa-bullseye d-block d-md-none"></i>
                                    <span class="d-none d-md-inline">Metas</span>
                                </button>
                                <button type="button" class="btn btn-outline-primary flex-shrink-0" data-section="relatorios">
                                    <i class="fas fa-chart-pie d-block d-md-none"></i>
                                    <span class="d-none d-md-inline">Relatórios</span>
                                </button>
                                <button type="button" class="btn btn-outline-primary flex-shrink-0" data-section="conta">
                                    <i class="fas fa-user-circle d-block d-md-none"></i>
                                    <span class="d-none d-md-inline">Sua Conta</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="help-content">
                        <!-- Seção Início -->
                        <div class="help-section mb-4 active" id="inicio-section">
                            <h4><i class="fas fa-home me-2"></i>Página Inicial (Dashboard)</h4>
                            <p>A página inicial do FinTracker apresenta uma visão geral completa das suas finanças. Aqui você poderá visualizar:</p>
                            
                            <div class="card mb-3 border-primary">
                                <div class="card-header bg-primary text-white">
                                    <i class="fas fa-calculator me-2"></i>Resumo Financeiro
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <p>Um painel de controle centralizado que exibe:</p>
                                            <ul>
                                                <li><strong>Receitas totais:</strong> Soma de todas suas entradas financeiras</li>
                                                <li><strong>Gastos totais:</strong> Soma de todas suas despesas</li>
                                                <li><strong>Saldo atual:</strong> Diferença entre receitas e gastos</li>
                                            </ul>
                                            <p class="small text-muted mb-0">Os valores são apresentados com formatação inteligente para grandes quantias (K para milhares, M para milhões). Passe o cursor ou toque nos valores para ver o montante exato.</p>
                                        </div>
                                        <div class="col-md-5">
                                            <div class="p-3 bg-light rounded border">
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span class="text-success">Receitas:</span>
                                                    <span class="fw-bold">R$ 3,5K</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span class="text-danger">Gastos:</span>
                                                    <span class="fw-bold">R$ 2,7K</span>
                                                </div>
                                                <div class="d-flex justify-content-between border-top pt-2">
                                                    <span class="text-primary">Saldo:</span>
                                                    <span class="fw-bold">R$ 800</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-light">
                                            <i class="fas fa-bullseye me-2 text-primary"></i>Acompanhamento de Metas
                                        </div>
                                        <div class="card-body">
                                            <p>Visualize o progresso das suas 3 metas mais recentes, incluindo:</p>
                                            <ul>
                                                <li>Nome e valor da meta</li>
                                                <li>Barra de progresso colorida baseada no seu saldo mensal</li>
                                                <li>Estimativa de tempo para alcançar cada meta</li>
                                            </ul>
                                            <div class="alert alert-info small">
                                                <i class="fas fa-info-circle me-1"></i> A estimativa é calculada usando seu saldo mensal (diferença entre receitas e gastos).
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-light">
                                            <i class="fas fa-chart-pie me-2 text-danger"></i>Distribuição de Gastos
                                        </div>
                                        <div class="card-body">
                                            <p>Gráfico em formato de rosca que revela como seus gastos estão distribuídos por categoria, permitindo identificar rapidamente seus principais focos de despesas.</p>
                                            <p class="small text-muted">Cada categoria recebe uma cor distinta para fácil visualização. Passe o mouse sobre cada seção para ver o valor exato gasto em cada categoria.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card mb-3">
                                <div class="card-header bg-light">
                                    <i class="fas fa-chart-bar me-2 text-success"></i>Comparativo de Gastos e Receitas
                                </div>
                                <div class="card-body">
                                    <div class="row align-items-center">
                                        <div class="col-md-8">
                                            <p>Um gráfico de barras mostra a evolução dos seus gastos e receitas nos últimos 6 meses, permitindo:</p>
                                            <ul>
                                                <li>Comparar o equilíbrio financeiro mês a mês</li>
                                                <li>Identificar tendências de aumento ou redução de receitas</li>
                                                <li>Detectar meses com gastos extraordinários</li>
                                                <li>Visualizar o impacto de decisões financeiras ao longo do tempo</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-4 text-center">
                                            <div class="border rounded p-2 bg-light">
                                                <div style="height: 100px; background: linear-gradient(180deg, rgba(75,192,192,0.2) 0%, rgba(255,99,132,0.2) 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fa fa-bar-chart fa-3x text-muted opacity-25"></i>
                                                </div>
                                                <div class="mt-2 small text-muted">Exemplo de gráfico comparativo</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="alert alert-success mt-3 mb-0">
                                        <i class="fas fa-sync-alt me-2"></i> <strong>Atualização automática:</strong> Todos os gráficos e indicadores são atualizados em tempo real sempre que você adiciona, edita ou remove transações.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Seção Transações -->
                        <div class="help-section mb-4" id="transacoes-section" style="display: none;">
                            <h4 class="mb-3"><i class="fas fa-exchange-alt me-2"></i>Gerenciando Transações</h4>
                            
                            <div class="card border-primary mb-4">
                                <div class="card-header bg-primary text-white">
                                    <i class="fas fa-wallet me-2"></i>Sobre as Transações
                                </div>
                                <div class="card-body">
                                    <p>O FinTracker permite gerenciar dois tipos de transações:</p>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="card mb-2 h-100 border-danger">
                                                <div class="card-body">
                                                    <h6 class="card-title text-danger"><i class="fas fa-arrow-down me-2"></i>Gastos</h6>
                                                    <p class="card-text small">Saídas financeiras como compras, pagamentos de contas ou outras despesas.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="card mb-2 h-100 border-success">
                                                <div class="card-body">
                                                    <h6 class="card-title text-success"><i class="fas fa-arrow-up me-2"></i>Receitas</h6>
                                                    <p class="card-text small">Entradas financeiras como salário, investimentos, freelances ou presentes.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="alert alert-info mt-3 mb-0">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-sync-alt me-2 fs-4"></i>
                                            <div>
                                                <strong>Sincronização automática:</strong> Suas transações são armazenadas localmente e sincronizadas com o servidor quando houver conexão, permitindo acesso mesmo offline.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ul class="nav nav-tabs mb-3" id="transaction-tabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="expenses-tab" data-bs-toggle="tab" data-bs-target="#expenses-content" type="button" role="tab">
                                        <i class="fas fa-money-bill-wave text-danger me-2"></i>Gastos
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="income-tab" data-bs-toggle="tab" data-bs-target="#income-content" type="button" role="tab">
                                        <i class="fas fa-money-check text-success me-2"></i>Receitas
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="filter-tab" data-bs-toggle="tab" data-bs-target="#filter-content" type="button" role="tab">
                                        <i class="fas fa-filter text-primary me-2"></i>Filtros
                                    </button>
                                </li>
                            </ul>

                            <div class="tab-content" id="transaction-content">
                                <!-- Conteúdo da aba Gastos -->
                                <div class="tab-pane fade show active" id="expenses-content" role="tabpanel">
                                    <h5 class="mb-3"><i class="fas fa-plus-circle text-danger me-2"></i>Adicionando um Gasto</h5>
                                    
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <ol class="mb-0">
                                                <li>Acesse a página de <strong>Gastos</strong> no menu principal</li>
                                                <li>Preencha o formulário com os detalhes do gasto:
                                                    <ul class="my-2">
                                                        <li><strong>Descrição:</strong> Identifique o gasto (ex: "Compra supermercado")</li>
                                                        <li><strong>Valor:</strong> Informe o valor gasto</li>
                                                        <li><strong>Categoria:</strong> Selecione uma categoria existente ou crie uma nova</li>
                                                        <li><strong>Data:</strong> Selecione quando o gasto foi realizado</li>
                                                    </ul>
                                                </li>
                                                <li>Clique no botão <span class="badge bg-primary">Adicionar Gasto</span> para salvar</li>
                                            </ol>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="card mb-3">
                                            <div class="card-header bg-light">
                                                <strong><i class="fas fa-edit me-2"></i>Gerenciando seus Gastos</strong>
                                            </div>
                                            <div class="card-body">
                                                <div class="row align-items-center">
                                                    <div class="col-md-7">
                                                        <p>Seus gastos são exibidos em uma tabela ordenada por data (do mais recente para o mais antigo). Para cada gasto, você pode:</p>
                                                        <ul class="mb-0">
                                                            <li><strong>Editar:</strong> Clique no botão <span class="badge bg-outline-primary"><i class="fas fa-edit"></i> Editar</span> para modificar qualquer informação</li>
                                                            <li><strong>Excluir:</strong> Clique no botão <span class="badge bg-outline-danger"><i class="fas fa-trash"></i> Excluir</span> para remover o gasto</li>
                                                        </ul>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="p-2 border rounded text-center bg-light">
                                                            <div class="table-responsive">
                                                                <table class="table table-sm table-striped mb-0" style="font-size: 0.8rem;">
                                                                    <thead class="table-dark">
                                                                        <tr>
                                                                            <th>Descrição</th>
                                                                            <th>Valor</th>
                                                                            <th>Ações</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Supermercado</td>
                                                                            <td>R$ 150,00</td>
                                                                            <td><i class="fas fa-edit text-primary"></i> <i class="fas fa-trash text-danger"></i></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Internet</td>
                                                                            <td>R$ 89,90</td>
                                                                            <td><i class="fas fa-edit text-primary"></i> <i class="fas fa-trash text-danger"></i></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div class="text-muted small mt-1">Exemplo de tabela de gastos</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="alert alert-warning">
                                        <div class="d-flex">
                                            <div class="me-3">
                                                <i class="fas fa-lightbulb"></i>
                                            </div>
                                            <div>
                                                <strong>Visualização no Dashboard:</strong> Os gastos são automaticamente considerados nos gráficos e indicadores do Dashboard, incluindo o resumo financeiro, a distribuição por categorias e os gráficos mensais.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Conteúdo da aba Receitas -->
                                <div class="tab-pane fade" id="income-content" role="tabpanel">
                                    <h5 class="mb-3"><i class="fas fa-plus-circle text-success me-2"></i>Adicionando uma Receita</h5>
                                    
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <ol class="mb-0">
                                                <li>Acesse a página de <strong>Receitas</strong> no menu principal</li>
                                                <li>Preencha o formulário com os detalhes da receita:
                                                    <ul class="my-2">
                                                        <li><strong>Descrição:</strong> Identifique a receita (ex: "Salário mensal")</li>
                                                        <li><strong>Valor:</strong> Informe o valor recebido</li>
                                                        <li><strong>Categoria:</strong> Selecione uma categoria existente ou crie uma nova</li>
                                                        <li><strong>Data:</strong> Selecione quando a receita foi recebida</li>
                                                    </ul>
                                                </li>
                                                <li>Clique no botão <span class="badge bg-success">Adicionar Receita</span> para salvar</li>
                                            </ol>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="card mb-3">
                                            <div class="card-header bg-light">
                                                <strong><i class="fas fa-edit me-2"></i>Gerenciando suas Receitas</strong>
                                            </div>
                                            <div class="card-body">
                                                <div class="row align-items-center">
                                                    <div class="col-md-7">
                                                        <p>Suas receitas são exibidas em uma tabela ordenada por data (da mais recente para a mais antiga). Para cada receita, você pode:</p>
                                                        <ul class="mb-0">
                                                            <li><strong>Editar:</strong> Clique no botão <span class="badge bg-outline-primary"><i class="fas fa-edit"></i> Editar</span> para modificar qualquer informação</li>
                                                            <li><strong>Excluir:</strong> Clique no botão <span class="badge bg-outline-danger"><i class="fas fa-trash"></i> Excluir</span> para remover a receita</li>
                                                        </ul>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="p-2 border rounded text-center bg-light">
                                                            <div class="table-responsive">
                                                                <table class="table table-sm table-striped mb-0" style="font-size: 0.8rem;">
                                                                    <thead class="table-dark">
                                                                        <tr>
                                                                            <th>Descrição</th>
                                                                            <th>Valor</th>
                                                                            <th>Ações</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>Salário</td>
                                                                            <td>R$ 3.500,00</td>
                                                                            <td><i class="fas fa-edit text-primary"></i> <i class="fas fa-trash text-danger"></i></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Freelance</td>
                                                                            <td>R$ 800,00</td>
                                                                            <td><i class="fas fa-edit text-primary"></i> <i class="fas fa-trash text-danger"></i></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div class="text-muted small mt-1">Exemplo de tabela de receitas</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="alert alert-success">
                                        <div class="d-flex">
                                            <div class="me-3">
                                                <i class="fas fa-lightbulb"></i>
                                            </div>
                                            <div>
                                                <strong>Impacto nas Metas:</strong> As receitas adicionadas contribuem diretamente para o cálculo das estimativas de tempo para alcançar suas metas financeiras, pois melhoram seu saldo mensal.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Conteúdo da aba Filtros -->
                                <div class="tab-pane fade" id="filter-content" role="tabpanel">
                                    <h5 class="mb-3"><i class="fas fa-filter text-primary me-2"></i>Filtragem Avançada</h5>
                                    
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <p>O FinTracker oferece um sistema avançado de filtros para encontrar facilmente suas transações:</p>
                                            
                                            <div class="row mt-3">
                                                <div class="col-md-6 mb-3">
                                                    <div class="card h-100">
                                                        <div class="card-header bg-light">Opções de Filtro Disponíveis</div>
                                                        <div class="card-body">
                                                            <ul class="small mb-0">
                                                                <li><strong>Texto:</strong> Busca por palavras na descrição</li>
                                                                <li><strong>Período:</strong> Filtra por data de início e fim</li>
                                                                <li><strong>Categoria:</strong> Filtra por categoria específica</li>
                                                                <li><strong>Combinações:</strong> Permite usar múltiplos filtros simultaneamente</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <div class="card h-100">
                                                        <div class="card-header bg-light">Como Usar</div>
                                                        <div class="card-body">
                                                            <ol class="small mb-0">
                                                                <li>Clique no cabeçalho "Filtros" ou no ícone para expandir o painel</li>
                                                                <li>Preencha os critérios desejados</li>
                                                                <li>Clique em "Aplicar filtros" ou pressione Enter</li>
                                                                <li>Para limpar, use os botões "x" individuais ou "Limpar todos"</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="border p-3 rounded mt-3 bg-light">
                                                <div class="d-flex align-items-center mb-2">
                                                    <div class="me-2"><strong>Filtros <span class="badge bg-primary">2</span></strong></div>
                                                    <div class="flex-grow-1">
                                                        <hr class="my-0">
                                                    </div>
                                                    <div class="ms-2">
                                                        <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-chevron-up"></i></button>
                                                    </div>
                                                </div>
                                                
                                                <div class="row g-2">
                                                    <div class="col-md-6">
                                                        <div class="input-group input-group-sm">
                                                            <span class="input-group-text">Texto</span>
                                                            <input type="text" class="form-control" value="supermercado" disabled>
                                                            <button class="btn btn-outline-secondary" disabled><i class="fas fa-times"></i></button>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="input-group input-group-sm">
                                                            <span class="input-group-text">Categoria</span>
                                                            <select class="form-control" disabled>
                                                                <option>Alimentação</option>
                                                            </select>
                                                            <button class="btn btn-outline-secondary" disabled><i class="fas fa-times"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="alert alert-info">
                                        <div class="d-flex">
                                            <div class="me-3">
                                                <i class="fas fa-info-circle"></i>
                                            </div>
                                            <div>
                                                <p class="mb-0"><strong>Contagem de resultados:</strong> O sistema mostra claramente quantas transações correspondem aos filtros aplicados, facilitando sua busca.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Conteúdo da aba Categorias -->
                                <div class="tab-pane fade" id="categories-content" role="tabpanel">
                                    <h5 class="mb-3"><i class="fas fa-folder-open me-2"></i>Gerenciando Categorias</h5>
                                    
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <p>O FinTracker permite que você organize suas finanças utilizando categorias personalizáveis:</p>
                                            
                                            <div class="row mb-3">
                                                <div class="col-md-6">
                                                    <h6 class="text-danger"><i class="fas fa-tag me-2"></i>Categorias de Gastos</h6>
                                                    <p class="small">Categorias padrão incluem:</p>
                                                    <ul class="small">
                                                        <li>Alimentação</li>
                                                        <li>Transporte</li>
                                                        <li>Lazer</li>
                                                        <li>Moradia</li>
                                                        <li>E outras que você criar</li>
                                                    </ul>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="text-success"><i class="fas fa-tag me-2"></i>Categorias de Receitas</h6>
                                                    <p class="small">Categorias padrão incluem:</p>
                                                    <ul class="small">
                                                        <li>Salário</li>
                                                        <li>Investimentos</li>
                                                        <li>Freelance</li>
                                                        <li>Presentes</li>
                                                        <li>E outras que você criar</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <h6 class="mt-3"><i class="fas fa-plus-circle me-2"></i>Criando Novas Categorias</h6>
                                            <p>Há duas maneiras de criar uma nova categoria:</p>
                                            
                                            <div class="row">
                                                <div class="col-md-6 mb-3">
                                                    <div class="card h-100 border-light">
                                                        <div class="card-header bg-light">Método 1: Durante o cadastro de transação</div>
                                                        <div class="card-body">
                                                            <ol class="small mb-0">
                                                                <li>Ao adicionar uma nova transação, selecione <strong>"Outros"</strong> no campo categoria</li>
                                                                <li>Um campo adicional aparecerá para você inserir o nome da nova categoria</li>
                                                                <li>A categoria será salva automaticamente e estará disponível para uso futuro</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <div class="card h-100 border-light">
                                                        <div class="card-header bg-light">Método 2: Durante a edição</div>
                                                        <div class="card-body">
                                                            <ol class="small mb-0">
                                                                <li>Ao editar uma transação existente, selecione <strong>"Outros"</strong> no campo categoria</li>
                                                                <li>Um diálogo aparecerá para você criar a nova categoria</li>
                                                                <li>A transação será atualizada com a nova categoria</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="alert alert-info mt-3 mb-0">
                                                <div class="d-flex">
                                                    <div class="me-3">
                                                        <i class="fas fa-chart-pie"></i>
                                                    </div>
                                                    <div>
                                                        <strong>Visualização nos Gráficos:</strong> As categorias são fundamentais para os gráficos de distribuição de gastos no Dashboard, permitindo identificar padrões e áreas que demandam atenção.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card bg-light mt-4">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="fas fa-sync-alt text-primary me-2"></i>Atualização Automática</h5>
                                    <p class="mb-0">Todas as suas transações acionam atualizações em tempo real em todos os componentes do sistema:</p>
                                    <div class="row mt-3">
                                        <div class="col-md-4 mb-2">
                                            <div class="d-flex align-items-center">
                                                <div class="me-2 text-primary">
                                                    <i class="fas fa-tachometer-alt"></i>
                                                </div>
                                                <div class="small">Dashboard com indicadores atualizados</div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <div class="d-flex align-items-center">
                                                <div class="me-2 text-primary">
                                                    <i class="fas fa-chart-pie"></i>
                                                </div>
                                                <div class="small">Gráficos e distribuição por categorias</div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <div class="d-flex align-items-center">
                                                <div class="me-2 text-primary">
                                                    <i class="fas fa-bullseye"></i>
                                                </div>
                                                <div class="small">Estimativas para alcançar metas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Seção Metas -->
                        <div class="help-section mb-4" id="metas-section" style="display: none;">
                            <h4 class="d-flex align-items-center mb-3">
                                <i class="fas fa-bullseye me-2"></i>Planejamento de Metas
                            </h4>
                            
                            <p>O sistema de metas financeiras do FinTracker ajuda você a planejar e acompanhar seus objetivos financeiros de forma clara e motivadora.</p>
                            
                            <div class="card border-primary mb-4">
                                <div class="card-header bg-primary text-white">
                                    <i class="fas fa-info-circle me-2"></i>Sobre as Metas Financeiras
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <p>As metas financeiras são objetivos de poupança que você deseja alcançar, como:</p>
                                            <ul>
                                                <li>Comprar um carro</li>
                                                <li>Dar entrada em um imóvel</li>
                                                <li>Realizar uma viagem</li>
                                                <li>Criar uma reserva de emergência</li>
                                                <li>Pagar uma dívida</li>
                                            </ul>
                                            <p class="mb-0">Com base no seu saldo mensal (diferença entre receitas e despesas), o sistema calcula automaticamente quanto tempo você levará para atingir cada meta.</p>
                                        </div>
                                        <div class="col-md-5 d-flex align-items-center justify-content-center">
                                            <div class="text-center p-3">
                                                <div class="rounded-circle bg-light p-4 d-inline-block mb-2" style="border: 2px dashed #0d6efd;">
                                                    <i class="fas fa-trophy fa-3x text-warning"></i>
                                                </div>
                                                <p class="small text-muted mb-0">Defina metas realistas e acompanhe seu progresso</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h5 class="mt-4 mb-3"><i class="fas fa-plus-circle me-2"></i>Criando Novas Metas</h5>
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="mb-3">Passo a Passo:</h6>
                                            <ol>
                                                <li class="mb-2">Acesse a seção <strong>"Metas"</strong> no menu principal</li>
                                                <li class="mb-2">Preencha o formulário com os seguintes dados:
                                                    <ul class="my-2">
                                                        <li><strong>Nome:</strong> Um título claro para sua meta (ex: "Viagem para Paris")</li>
                                                        <li><strong>Descrição:</strong> Detalhes adicionais sobre seu objetivo</li>
                                                        <li><strong>Valor:</strong> Quanto dinheiro você precisa economizar</li>
                                                    </ul>
                                                </li>
                                                <li class="mb-2">Clique no botão <span class="badge bg-primary">Adicionar Meta</span></li>
                                                <li>A meta será adicionada à sua lista e o sistema calculará automaticamente suas estimativas</li>
                                            </ol>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="border rounded p-3 bg-light h-100">
                                                <h6 class="text-center mb-3"><i class="fas fa-keyboard me-2"></i>Exemplo de Formulário</h6>
                                                <div class="mb-3">
                                                    <label class="form-label small">Nome</label>
                                                    <input type="text" class="form-control form-control-sm" value="Viagem de férias" disabled>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label small">Descrição</label>
                                                    <input type="text" class="form-control form-control-sm" value="Viagem para o nordeste em janeiro" disabled>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label small">Valor (R$)</label>
                                                    <input type="text" class="form-control form-control-sm" value="5000.00" disabled>
                                                </div>
                                                <div class="d-grid">
                                                    <button class="btn btn-sm btn-primary" disabled>Adicionar Meta</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mb-3"><i class="fas fa-chart-line me-2"></i>Estimativas e Progresso</h5>
                            <div class="card mb-4">
                                <div class="card-header bg-light">
                                    <strong><i class="fas fa-calculator me-2"></i>Como as Estimativas São Calculadas</strong>
                                </div>
                                <div class="card-body">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i> O sistema utiliza seu saldo mensal (receitas menos despesas) para calcular quanto tempo levará para atingir cada meta.
                                    </div>
                                    
                                    <div class="row mt-4">
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100 border-success">
                                                <div class="card-header bg-success text-white">
                                                    Exemplo de Cálculo
                                                </div>
                                                <div class="card-body">
                                                    <div class="d-flex justify-content-between mb-2">
                                                        <span>Receitas mensais:</span>
                                                        <span class="fw-bold">R$ 3.500,00</span>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-2">
                                                        <span>Gastos mensais:</span>
                                                        <span class="fw-bold">R$ 2.700,00</span>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-3 pt-2 border-top">
                                                        <span>Saldo mensal:</span>
                                                        <span class="fw-bold text-success">R$ 800,00</span>
                                                    </div>
                                                    
                                                    <div class="d-flex justify-content-between pt-2">
                                                        <span>Meta "Viagem":</span>
                                                        <span class="fw-bold">R$ 5.000,00</span>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-2">
                                                        <span>Tempo estimado:</span>
                                                        <span class="fw-bold text-primary">6 meses e 1 semana</span>
                                                    </div>
                                                    
                                                    <div class="small text-muted mt-3">
                                                        Cálculo: R$ 5.000 ÷ R$ 800 = 6,25 meses
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-header bg-light">
                                                    Visualização do Progresso
                                                </div>
                                                <div class="card-body">
                                                    <div class="mb-4">
                                                        <div class="d-flex justify-content-between mb-2">
                                                            <strong>Meta: Viagem de Férias</strong>
                                                            <span>R$ 5.000,00</span>
                                                        </div>
                                                        <div class="mb-2">
                                                            <div class="progress" style="height: 20px;">
                                                                <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: 16%;" 
                                                                    aria-valuenow="16" aria-valuemin="0" aria-valuemax="100">16% por mês</div>
                                                            </div>
                                                        </div>
                                                        <div class="small text-muted">Estimativa: <span class="text-primary">6 meses e 1 semana</span></div>
                                                    </div>
                                                    
                                                    <div>
                                                        <div class="d-flex justify-content-between mb-2">
                                                            <strong>Meta: Notebook Novo</strong>
                                                            <span>R$ 3.200,00</span>
                                                        </div>
                                                        <div class="mb-2">
                                                            <div class="progress" style="height: 20px;">
                                                                <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 25%;" 
                                                                    aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25% por mês</div>
                                                            </div>
                                                        </div>
                                                        <div class="small text-muted">Estimativa: <span class="text-primary">4 meses</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="alert alert-warning mt-3 mb-0">
                                        <div class="d-flex">
                                            <div class="me-3">
                                                <i class="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <div>
                                                <strong>Observação importante:</strong> Se seu saldo mensal for zero ou negativo, o sistema não conseguirá calcular estimativas. Nesse caso, será necessário aumentar suas receitas ou reduzir seus gastos para criar um saldo positivo.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mb-3"><i class="fas fa-filter me-2"></i>Filtrando suas Metas</h5>
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <p>O FinTracker permite que você filtre suas metas para encontrar rapidamente as informações desejadas:</p>
                                            <ul>
                                                <li><strong>Filtro por texto:</strong> Busca no nome e descrição das metas</li>
                                                <li><strong>Filtro por valor máximo:</strong> Exibe apenas metas até um determinado valor</li>
                                            </ul>
                                            <div class="alert alert-info small mb-0">
                                                <i class="fas fa-lightbulb me-2"></i> <strong>Dica:</strong> Use os filtros para identificar metas mais acessíveis quando seu saldo mensal estiver reduzido.
                                            </div>
                                        </div>
                                        <div class="col-md-5">
                                            <div class="border rounded p-3 bg-light">
                                                <div class="d-flex align-items-center mb-2">
                                                    <div class="me-2"><strong>Filtros <span class="badge bg-primary">2</span></strong></div>
                                                    <div class="flex-grow-1">
                                                        <hr class="my-0">
                                                    </div>
                                                </div>
                                                <div class="mb-2">
                                                    <div class="input-group input-group-sm">
                                                        <span class="input-group-text">Texto</span>
                                                        <input type="text" class="form-control" placeholder="N/Desc" disabled>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="input-group input-group-sm">
                                                        <span class="input-group-text">Valor máximo</span>
                                                        <input type="number" class="form-control" value="5000" disabled>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mb-3"><i class="fas fa-edit me-2"></i>Gerenciando Suas Metas</h5>
                            <div class="card mb-3">
                                <div class="card-body">
                                    <div class="row align-items-center">
                                        <div class="col-md-7">
                                            <p class="mb-3">Suas metas são exibidas em uma tabela organizada, onde você pode:</p>
                                            <ul class="mb-0">
                                                <li class="mb-2"><strong>Visualizar detalhes:</strong> Nome, descrição, valor necessário e data de criação</li>
                                                <li class="mb-2"><strong>Editar:</strong> Clique no botão <span class="badge bg-outline-primary"><i class="fas fa-edit"></i> Editar</span> para modificar qualquer informação da meta</li>
                                                <li><strong>Excluir:</strong> Clique no botão <span class="badge bg-outline-danger"><i class="fas fa-trash"></i> Excluir</span> para remover uma meta que já não seja mais relevante</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-5">
                                            <div class="table-responsive border rounded">
                                                <table class="table table-striped table-sm" style="font-size: 0.8rem;">
                                                    <thead class="table-dark">
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th>Valor</th>
                                                            <th>Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Viagem</td>
                                                            <td>R$ 5.000,00</td>
                                                            <td>
                                                                <i class="fas fa-edit text-primary"></i>
                                                                <i class="fas fa-trash text-danger ms-2"></i>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Notebook</td>
                                                            <td>R$ 3.200,00</td>
                                                            <td>
                                                                <i class="fas fa-edit text-primary"></i>
                                                                <i class="fas fa-trash text-danger ms-2"></i>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="text-center mt-1">
                                                <small class="text-muted">Exemplo da lista de metas</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mb-3"><i class="fas fa-sync-alt me-2"></i>Atualização Automática</h5>
                            <div class="card mb-3">
                                <div class="card-body">
                                    <p>O sistema de metas do FinTracker foi projetado para se manter sempre atualizado:</p>
                                    <ul>
                                        <li><strong>Recálculo automático:</strong> As estimativas são recalculadas sempre que você adiciona, edita ou remove transações de gastos e receitas</li>
                                        <li><strong>Dados persistentes:</strong> Suas metas são salvas localmente e sincronizadas com a nuvem quando há conexão</li>
                                    <div class="alert alert-success mb-0">
                                        <div class="d-flex">
                                            <div class="me-3">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                            <div>
                                                <strong>Tempo real:</strong> As metas são atualizadas instantaneamente em todas as seções do aplicativo, incluindo o Dashboard principal.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-4">
                                <div class="d-flex">
                                    <div class="me-3 fs-4">
                                        <i class="fas fa-lightbulb"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Dicas para definir metas eficazes</h5>
                                        <p class="mb-2">Para aproveitar ao máximo o sistema de metas:</p>
                                        <ul class="mb-0">
                                            <li>Defina metas específicas e mensuráveis</li>
                                            <li>Priorize suas metas por importância</li>
                                            <li>Revise suas metas regularmente</li>
                                            <li>Celebre quando atingir cada meta</li>
                                            <li>Aumente seu saldo mensal para atingir suas metas mais rapidamente</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Seção Relatórios -->
                        <div class="help-section mb-4" id="relatorios-section" style="display: none;">
                            <h4 class="d-flex align-items-center">
                                <i class="fas fa-chart-pie me-2"></i>Relatórios Financeiros
                            </h4>
                            
                            <p>A seção de relatórios proporciona uma visão completa da sua vida financeira através de gráficos interativos e análises detalhadas de seus dados.</p>
                            
                            <div class="card border-primary mb-4">
                                <div class="card-header bg-primary text-white">
                                    <i class="fas fa-filter me-2"></i>Filtragem por Período
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-8">
                                            <p>O sistema permite analisar seus dados financeiros em diferentes intervalos de tempo para uma análise mais precisa:</p>
                                            <div class="mb-3">
                                                <select class="form-select form-select-sm" disabled>
                                                    <option>Todos os dados (sem restrição de data)</option>
                                                    <option>Últimos 30 dias</option>
                                                    <option>Últimos 90 dias</option>
                                                    <option>Últimos 180 dias</option>
                                                    <option>Último ano</option>
                                                    <option>Período personalizado</option>
                                                </select>
                                            </div>
                                            <p class="small text-muted">Ao selecionar "Período personalizado", você pode definir datas específicas de início e fim para sua análise.</p>
                                            <div class="alert alert-info small mb-0">
                                                <i class="fas fa-lightbulb me-2"></i> <strong>Dica:</strong> A opção "Todos os dados" é útil para uma visão completa das suas finanças desde o início do uso do sistema.
                                            </div>
                                        </div>
                                        <div class="col-md-4 text-center">
                                            <div class="p-3 rounded bg-light border">
                                                <i class="fas fa-calendar-alt fa-3x text-primary mb-2"></i>
                                                <p class="small mb-0">Os períodos predefinidos facilitam análises rápidas dos seus dados financeiros.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mt-4 mb-3"><i class="fas fa-calculator me-2"></i>Indicadores Financeiros</h5>
                            <div class="row mb-4">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 border-primary">
                                        <div class="card-body">
                                            <h6 class="card-title text-primary"><i class="fas fa-money-bill-wave me-2"></i>Total de Gastos e Receitas</h6>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-danger">Gastos:</span>
                                                <span class="fw-bold" id="totalGastosDemo">R$ 2.540,00</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-success">Receitas:</span>
                                                <span class="fw-bold" id="totalReceitasDemo">R$ 4.350,00</span>
                                            </div>
                                            <div class="d-flex justify-content-between pt-2 border-top">
                                                <span>Saldo:</span>
                                                <span class="fw-bold text-primary" id="saldoTotalDemo">R$ 1.810,00</span>
                                            </div>
                                            <p class="card-text small text-muted mt-2">Os valores são apresentados em formato abreviado para grandes quantias (K para milhares, M para milhões), com detalhes completos disponíveis ao passar o mouse.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 border-success">
                                        <div class="card-body">
                                            <h6 class="card-title text-success"><i class="fas fa-piggy-bank me-2"></i>Economia Média Mensal</h6>
                                            <div class="text-center my-3">
                                                <div class="display-6 text-success" id="economiaMediaDemo">R$ 603,33</div>
                                                <div class="small text-muted">por mês</div>
                                            </div>
                                            <p class="card-text small">Esta métrica é calculada dividindo seu saldo pelo número de meses no período selecionado, ajudando a planejar metas de longo prazo.</p>
                                            <div class="progress mt-2" style="height: 10px;">
                                                <div class="progress-bar bg-success" role="progressbar" style="width: 65%;" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mt-4 mb-3"><i class="fas fa-chart-line me-2"></i>Visualizações Gráficas</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-chart-line text-primary me-2"></i><strong>Evolução Financeira</strong></span>
                                            <span class="badge bg-secondary">Interativo</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="text-center mb-2" style="height: 100px; position: relative;">
                                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(75,192,192,0.1) 0%, rgba(75,192,192,0.4) 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-chart-line fa-3x text-primary opacity-25"></i>
                                                </div>
                                            </div>
                                            <p class="card-text small">Este gráfico de linha mostra a evolução do seu saldo acumulado ao longo do tempo, indicando momentos de crescimento ou diminuição do seu patrimônio.</p>
                                            <p class="card-text small text-muted"><i class="fas fa-info-circle me-1"></i> O sistema ajusta automaticamente a visualização entre diária e semanal, dependendo do tamanho do período selecionado.</p>
                                        </div>
                                        <div class="card-footer bg-white">
                                            <div class="small text-muted">Atualizações: Tempo real</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-chart-pie text-danger me-2"></i><strong>Top Categorias de Gastos</strong></span>
                                            <span class="badge bg-danger">Popular</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="text-center mb-2" style="height: 100px; position: relative;">
                                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,99,132,0.1) 0%, rgba(255,99,132,0.4) 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-chart-pie fa-3x text-danger opacity-25"></i>
                                                </div>
                                            </div>
                                            <p class="card-text small">Gráfico em formato de rosca que revela suas cinco principais categorias de gastos, permitindo identificar rapidamente onde seu dinheiro está sendo mais utilizado.</p>
                                            <p class="card-text small text-muted"><i class="fas fa-lightbulb me-1"></i> Use esta visualização para identificar áreas onde você pode economizar.</p>
                                        </div>
                                        <div class="card-footer bg-white">
                                            <div class="small text-muted">Método: Top 5 categorias por valor</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-chart-line text-success me-2"></i><strong>Tendências de Receitas e Gastos</strong></span>
                                            <span class="badge bg-success">Análise</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="text-center mb-2" style="height: 100px; position: relative;">
                                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(75,192,192,0.1) 0%, rgba(255,99,132,0.3) 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-chart-line fa-3x text-success opacity-25"></i>
                                                </div>
                                            </div>
                                            <p class="card-text small">Este gráfico de linhas sobrepostas permite comparar a evolução mensal dos seus gastos (vermelho) e receitas (verde), tornando visíveis os padrões sazonais e tendências.</p>
                                            <p class="card-text small text-muted"><i class="fas fa-search-dollar me-1"></i> Útil para detectar meses atípicos com gastos extraordinários ou receitas adicionais.</p>
                                        </div>
                                        <div class="card-footer bg-white">
                                            <div class="small text-muted">Agrupamento: Mensal</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                            <span><i class="fas fa-chart-bar text-warning me-2"></i><strong>Comparativo Mensal por Categoria</strong></span>
                                            <span class="badge bg-warning text-dark">Detalhado</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="text-center mb-2" style="height: 100px; position: relative;">
                                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,206,86,0.1) 0%, rgba(255,206,86,0.4) 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-chart-bar fa-3x text-warning opacity-25"></i>
                                                </div>
                                            </div>
                                            <p class="card-text small">Visualização em barras empilhadas que mostra como seus gastos em diferentes categorias evoluem mês a mês, com cada cor representando uma categoria diferente.</p>
                                            <p class="card-text small text-muted"><i class="fas fa-palette me-1"></i> O sistema usa cores distintas para facilitar a identificação visual de cada categoria de despesa.</p>
                                        </div>
                                        <div class="card-footer bg-white">
                                            <div class="small text-muted">Cores: Atribuídas automaticamente por categoria</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h5 class="mt-4"><i class="fas fa-table me-2"></i>Histórico de Transações</h5>
                            <div class="card">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <p class="mb-2">Uma tabela completa com todas as suas transações no período selecionado:</p>
                                            <ul>
                                                <li><strong>Data:</strong> Quando a transação ocorreu</li>
                                                <li><strong>Descrição:</strong> Identificador da transação</li>
                                                <li><strong>Categoria:</strong> Classificação personalizada</li>
                                                <li><strong>Tipo:</strong> <span class="badge bg-success">Receita</span> ou <span class="badge bg-danger">Gasto</span></li>
                                                <li><strong>Valor:</strong> Montante da transação</li>
                                            </ul>
                                            <p class="card-text small text-muted">A tabela é ordenada por data (transações mais recentes primeiro) e pode ser filtrada pelo período escolhido.</p>
                                        </div>
                                        <div class="col-md-5">
                                            <div class="table-responsive border rounded">
                                                <table class="table table-sm table-striped mb-0" style="font-size: 0.8rem;">
                                                    <thead class="table-dark">
                                                        <tr>
                                                            <th>Data</th>
                                                            <th>Descrição</th>
                                                            <th>Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>09/04/2025</td>
                                                            <td>Salário</td>
                                                            <td><span class="text-success">R$ 3.500,00</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>09/04/2025</td>
                                                            <td>Aluguel</td>
                                                            <td><span class="text-danger">R$ 1.200,00</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>09/04/2025</td>
                                                            <td>Mercado</td>
                                                            <td><span class="text-danger">R$ 320,50</span></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="text-center mt-1">
                                                <small class="text-muted">Exemplo simplificado</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-4 d-flex">
                                <div class="me-3 fs-4">
                                    <i class="fas fa-sync-alt"></i>
                                </div>
                                <div>
                                    <h5 class="alert-heading">Atualização em tempo real</h5>
                                    <p class="mb-0">Todos os relatórios e gráficos são atualizados automaticamente sempre que você adiciona, edita ou remove transações. Isso funciona até mesmo quando você está usando o sistema em várias abas ou dispositivos diferentes ao mesmo tempo.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Seção Conta -->
                        <div class="help-section" id="conta-section" style="display: none;">
                            <h4 class="d-flex align-items-center mb-3">
                                <i class="fas fa-user-circle me-2"></i>Sua Conta
                            </h4>
                            
                            <p>O menu "Sua Conta" está disponível em todas as páginas do sistema e oferece acesso rápido às ações relacionadas à sua conta.</p>
                            
                            <div class="card border-primary mb-4">
                                <div class="card-header bg-primary text-white">
                                    <i class="fas fa-info-circle me-2"></i>Acessando o Menu da Conta
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p>O menu da conta pode ser acessado de duas maneiras:</p>
                                            <ol>
                                                <li class="mb-2">Clicando no seu <strong>nome de usuário</strong> no canto superior direito da tela</li>
                                                <li>Clicando no <strong>ícone de perfil</strong> <i class="fas fa-user-circle"></i> ao lado do seu nome</li>
                                            </ol>
                                            <p class="mb-0">Este menu está presente em todas as páginas do sistema para facilitar o acesso rápido às funções da sua conta.</p>
                                        </div>
                                        <div class="col-md-6 d-flex align-items-center justify-content-center">
                                            <div class="border rounded p-3 bg-light">
                                                <div class="dropdown-menu d-block position-static pt-0 mx-0 rounded-3 shadow overflow-hidden" style="width: 220px;">
                                                    <div class="p-2 bg-primary text-white">
                                                        <div class="d-flex align-items-center">
                                                            <i class="fas fa-user-circle fa-2x me-2"></i>
                                                            <div>
                                                                <strong class="d-block">Usuário Exemplo</strong>
                                                                <small>usuario@exemplo.com</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="dropdown-divider"></div>
                                                    <a href="#" class="dropdown-item px-4 py-2">
                                                        <i class="fas fa-user-edit me-2 text-primary"></i>Editar Perfil
                                                    </a>
                                                    <a href="#" class="dropdown-item px-4 py-2">
                                                        <i class="fas fa-sign-out-alt me-2 text-primary"></i>Sair
                                                    </a>
                                                    <a href="#" class="dropdown-item px-4 py-2 text-danger">
                                                        <i class="fas fa-trash-alt me-2"></i>Excluir Conta
                                                    </a>
                                                </div>
                                                <div class="text-center mt-2">
                                                    <small class="text-muted">Exemplo do menu da conta</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h5 class="mb-3"><i class="fas fa-user-edit me-2"></i>Edição de Perfil</h5>
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-7">
                                            <p>Na página de perfil, você pode personalizar suas informações:</p>
                                            <ul>
                                                <li><strong>Nome:</strong> Atualize seu nome de exibição no sistema</li>
                                                <li><strong>Senha:</strong> Altere sua senha de acesso quando necessário</li>
                                            </ul>
                                            <p>Para acessar esta funcionalidade:</p>
                                            <ol>
                                                <li>Clique no menu da sua conta</li>
                                                <li>Selecione a opção <strong>"Editar Perfil"</strong></li>
                                                <li>Modifique as informações desejadas</li>
                                                <li>Clique em <strong>"Salvar"</strong> para aplicar as alterações</li>
                                            </ol>
                                            <div class="alert alert-info mb-0">
                                                <i class="fas fa-lightbulb me-2"></i> <strong>Dica:</strong> Mantenha sua senha forte usando letras maiúsculas, minúsculas, números e símbolos.
                                            </div>
                                        </div>
                                        <div class="col-md-5">
                                            <div class="border rounded p-3 bg-light h-100">
                                                <div class="text-center mb-3">
                                                    <img src="https://ui-avatars.com/api/?name=Usuario&background=4e73df&color=fff&size=80&rounded=true" alt="Avatar" class="rounded-circle mb-2">
                                                    <h6 class="mb-0">Edição de Perfil</h6>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label small">Nome</label>
                                                    <input type="text" class="form-control form-control-sm" value="Usuário Exemplo" disabled>
                                                </div>
                                                <div class="mb-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="changePasswordDemo" disabled>
                                                        <label class="form-check-label" for="changePasswordDemo">
                                                            Alterar senha
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-between">
                                                    <button class="btn btn-sm btn-secondary" disabled>Cancelar</button>
                                                    <button class="btn btn-sm btn-primary" disabled>Salvar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mb-4">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header bg-light">
                                            <strong><i class="fas fa-sign-out-alt me-2 text-primary"></i>Sair do Sistema</strong>
                                        </div>
                                        <div class="card-body">
                                            <p>Para encerrar sua sessão no FinTracker:</p>
                                            <ol>
                                                <li>Clique no seu nome ou ícone de perfil</li>
                                                <li>Selecione a opção <strong>"Sair"</strong></li>
                                                <li>Você será redirecionado para a página de login</li>
                                            </ol>
                                            <div class="alert alert-info small mt-3 mb-0">
                                                <i class="fas fa-info-circle me-2"></i> Importante: Ao fazer logout, sua sessão será encerrada, mas seus dados continuarão seguros no sistema.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 border-danger">
                                        <div class="card-header bg-danger text-white">
                                            <strong><i class="fas fa-exclamation-triangle me-2"></i>Excluir Conta</strong>
                                        </div>
                                        <div class="card-body">
                                            <div class="alert alert-warning mb-3">
                                                <i class="fas fa-exclamation-circle me-2"></i> <strong>Atenção!</strong> Esta ação é permanente e não pode ser desfeita.
                                            </div>
                                            <p>Para excluir sua conta:</p>
                                            <ol>
                                                <li>Clique no seu nome ou ícone de perfil</li>
                                                <li>Selecione a opção <strong>"Excluir Conta"</strong></li>
                                                <li>Confirme sua decisão e digite sua senha para verificação</li>
                                                <li>Confirme novamente para concluir o processo</li>
                                            </ol>
                                            <p class="small text-danger mb-0"><strong>Nota:</strong> Todos os seus dados, incluindo transações, metas e relatórios serão permanentemente excluídos.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card mb-4">
                                <div class="card-header bg-light d-flex align-items-center">
                                    <i class="fas fa-shield-alt me-2 text-primary"></i>
                                    <strong>Segurança e Privacidade</strong>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <p>O FinTracker prioriza a segurança dos seus dados financeiros:</p>
                                            <ul class="mb-3">
                                                <li>Todas as suas informações são armazenadas com criptografia</li>
                                                <li>Seus dados financeiros são privados e não são compartilhados com terceiros</li>
                                                <li>As senhas são armazenadas de forma segura e não são visíveis nem para os administradores</li>
                                            </ul>
                                            <p class="mb-0">Recomendamos algumas práticas de segurança:</p>
                                            <div class="row mt-3">
                                                <div class="col-md-6">
                                                    <div class="card border-success mb-2">
                                                        <div class="card-body py-2">
                                                            <div class="d-flex">
                                                                <div class="me-3 text-success">
                                                                    <i class="fas fa-check-circle"></i>
                                                                </div>
                                                                <div>
                                                                    <p class="mb-0 small">Faça logout após usar o sistema em dispositivos públicos</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="card border-success mb-2">
                                                        <div class="card-body py-2">
                                                            <div class="d-flex">
                                                                <div class="me-3 text-success">
                                                                    <i class="fas fa-check-circle"></i>
                                                                </div>
                                                                <div>
                                                                    <p class="mb-0 small">Use uma senha forte e exclusiva para sua conta</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="card border-success mb-2">
                                                        <div class="card-body py-2">
                                                            <div class="d-flex">
                                                                <div class="me-3 text-success">
                                                                    <i class="fas fa-check-circle"></i>
                                                                </div>
                                                                <div>
                                                                    <p class="mb-0 small">Nunca compartilhe suas credenciais de acesso</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="card border-success mb-2">
                                                        <div class="card-body py-2">
                                                            <div class="d-flex">
                                                                <div class="me-3 text-success">
                                                                    <i class="fas fa-check-circle"></i>
                                                                </div>
                                                                <div>
                                                                    <p class="mb-0 small">Verifique regularmente suas transações</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-success mt-4">
                                <div class="d-flex">
                                    <div class="me-3 fs-4">
                                        <i class="fas fa-user-shield"></i>
                                    </div>
                                    <div>
                                        <h5 class="alert-heading">Indicador de Força de Senha</h5>
                                        <p>Ao criar ou alterar sua senha, utilize o indicador de força que mostra visualmente a segurança da senha escolhida:</p>
                                        <div class="row mt-3">
                                            <div class="col-md-4 mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                                                        <div class="progress-bar bg-danger" role="progressbar" style="width: 30%;" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                    <span class="small text-danger">Fraca</span>
                                                </div>
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                                                        <div class="progress-bar bg-warning" role="progressbar" style="width: 60%;" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                    <span class="small text-warning">Média</span>
                                                </div>
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                                                        <div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                    <span class="small text-success">Forte</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert alert-info mt-4 d-flex">
                                <div class="me-3 fs-4">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <div>
                                    <h5 class="alert-heading">Recursos em desenvolvimento</h5>
                                    <p>Continuamos trabalhando em novas funcionalidades para o menu "Sua Conta", incluindo:</p>
                                    <ul class="mb-0">
                                        <li><strong>Foto de perfil personalizada:</strong> Adicione sua própria imagem de avatar</li>
                                        <li><strong>Autenticação em duas etapas:</strong> Para mais segurança na sua conta</li>
                                        <li><strong>Temas de interface:</strong> Escolha entre modo claro e escuro</li>
                                        <li><strong>Configurações de notificações:</strong> Personalize alertas e lembretes</li>
                                    </ul>
                                    <hr>
                                    <p class="mb-0">Fique atento às atualizações futuras para aproveitar esses recursos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal "Sobre" -->
    <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="aboutModalLabel"><i class="fas fa-info-circle me-2"></i>Sobre o FinTracker</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-wallet fa-4x text-info mb-3"></i>
                        <h3>FinTracker</h3>
                        <p class="text-muted">Versão 1.0.0</p>
                    </div>
                    
                    <div class="about-section mb-4">
                        <h4>Visão Geral</h4>
                        <p>O FinTracker é uma aplicação web desenvolvida para ajudar pessoas a gerenciar suas finanças pessoais de forma simples e eficiente. Nosso objetivo é proporcionar uma ferramenta intuitiva que permita o acompanhamento de gastos, criação de orçamentos e visualização de relatórios financeiros.</p>
                    </div>
                    
                    <div class="about-section mb-4">
                        <h4>Como Funciona</h4>
                        <p>O FinTracker utiliza uma abordagem baseada em categorias para ajudar você a organizar suas transações financeiras. O sistema permite:</p>
                        <ul>
                            <li>Registrar receitas e gastos</li>
                            <li>Categorizar transações automaticamente</li>
                            <li>Criar e monitorar orçamentos mensais</li>
                            <li>Gerar relatórios e gráficos detalhados</li>
                            <li>Estabelecer e acompanhar metas financeiras</li>
                        </ul>
                    </div>
                    
                    <div class="about-section mb-4">
                        <h4>Recursos Principais</h4>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-tachometer-alt text-primary me-2"></i>Dashboard Intuitivo</h5>
                                        <p class="card-text">Visão geral das suas finanças em um único lugar, com gráficos interativos e resumos claros.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-tags text-success me-2"></i>Categorização Inteligente</h5>
                                        <p class="card-text">Organize seus gastos em categorias personalizáveis para análises mais precisas.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-bullseye text-danger me-2"></i>Metas Financeiras</h5>
                                        <p class="card-text">Estabeleça e acompanhe o progresso das suas metas com indicadores visuais.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-chart-bar text-warning me-2"></i>Relatórios Detalhados</h5>
                                        <p class="card-text">Analise seus padrões de gastos com relatórios personalizáveis e gráficos interativos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h4>Desenvolvido por</h4>
                        <p>O FinTracker foi desenvolvido como um projeto acadêmico de gerenciamento financeiro pessoal, utilizando tecnologias web modernas para criar uma experiência responsiva e amigável.</p>
                        <p class="mb-0"><strong>Tecnologias utilizadas:</strong></p>
                        <div class="tech-badges my-3">
                            <span class="badge bg-primary me-2">HTML5</span>
                            <span class="badge bg-success me-2">CSS3</span>
                            <span class="badge bg-info me-2">JavaScript</span>
                            <span class="badge bg-warning text-dark me-2">Bootstrap 5</span>
                            <span class="badge bg-danger me-2">Chart.js</span>
                            <span class="badge bg-light text-dark me-2">Firebase</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal "Privacidade" -->
    <div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="privacyModalLabel"><i class="fas fa-shield-alt me-2"></i>Política de Privacidade</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Importante:</strong> Leia atentamente nossa política de privacidade para entender como tratamos seus dados.
                    </div>
                    
                    <div class="privacy-section mb-4">
                        <h4>Lei Geral de Proteção de Dados (LGPD)</h4>
                        <p>O FinTracker está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Respeitamos sua privacidade e nos comprometemos a proteger seus dados pessoais.</p>
                        <div class="accordion" id="lgpdAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                        O que é a LGPD e como ela afeta você?
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#lgpdAccordion">
                                    <div class="accordion-body">
                                        <p>A Lei Geral de Proteção de Dados (LGPD) estabelece regras sobre como as empresas devem coletar, armazenar, processar e compartilhar dados pessoais. Esta lei garante que você tenha:</p>
                                        <ul>
                                            <li>Direito de acesso aos seus dados</li>
                                            <li>Direito de correção de dados incompletos ou incorretos</li>
                                            <li>Direito de exclusão dos seus dados</li>
                                            <li>Direito de portabilidade para outro serviço</li>
                                            <li>Direito de ser informado sobre o uso dos seus dados</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="privacy-section mb-4">
                        <h4>Dados Coletados</h4>
                        <p>Coletamos apenas as informações necessárias para o funcionamento do serviço:</p>
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Tipo de Dado</th>
                                        <th>Finalidade</th>
                                        <th>Tempo de Armazenamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Informações de cadastro (nome, email)</td>
                                        <td>Autenticação e comunicação</td>
                                        <td>Enquanto a conta estiver ativa</td>
                                    </tr>
                                    <tr>
                                        <td>Dados financeiros inseridos por você</td>
                                        <td>Funcionalidades do sistema</td>
                                        <td>Enquanto a conta estiver ativa</td>
                                    </tr>
                                    <tr>
                                        <td>Dados de uso e interação</td>
                                        <td>Melhorias na experiência</td>
                                        <td>Até 12 meses</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="privacy-section mb-4">
                        <h4>Utilização dos Dados</h4>
                        <p>Seus dados são utilizados exclusivamente para:</p>
                        <ul>
                            <li>Fornecer os serviços do FinTracker</li>
                            <li>Melhorar a experiência do usuário</li>
                            <li>Enviar comunicações relevantes (mediante autorização)</li>
                        </ul>
                    </div>
                    
                    <div class="privacy-section mb-4">
                        <h4>Segurança dos Dados</h4>
                        <p>Implementamos medidas de segurança para proteger seus dados:</p>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-lock text-danger me-2"></i>Criptografia</h5>
                                        <p class="card-text">Seus dados são criptografados em trânsito e em repouso, usando protocolos seguros.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-user-shield text-primary me-2"></i>Acesso Restrito</h5>
                                        <p class="card-text">Apenas pessoal autorizado tem acesso aos sistemas que armazenam dados dos usuários.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-search text-success me-2"></i>Monitoramento</h5>
                                        <p class="card-text">Sistemas de detecção de intrusão e monitoramento contínuo contra ameaças.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title"><i class="fas fa-database text-warning me-2"></i>Backups</h5>
                                        <p class="card-text">Realizamos backups regulares e seguros para garantir a integridade dos dados.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="privacy-section">
                        <h4>Seus Direitos</h4>
                        <p>De acordo com a LGPD, você tem direito a:</p>
                        <ul>
                            <li>Confirmar a existência de tratamento de dados</li>
                            <li>Acessar seus dados</li>
                            <li>Corrigir dados incompletos ou desatualizados</li>
                            <li>Solicitar a exclusão de seus dados</li>
                            <li>Revogar o consentimento a qualquer momento</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" id="privacy-accept-btn">
                        <i class="fas fa-check me-2"></i>Entendi e Aceito
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    // add os modais ao final do body
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    // Adicionar estilos específicos para navegação responsiva
    const styleElement = document.createElement('style');
    styleElement.textContent = `
               .help-nav {
                   overflow-x: auto;
                   -webkit-overflow-scrolling: touch;
                   scrollbar-width: thin;
                   padding-bottom: 5px;
               }
               .help-nav::-webkit-scrollbar {
                   height: 4px;
               }
               .help-nav::-webkit-scrollbar-thumb {
                   background-color: rgba(13, 110, 253, 0.3);
                   border-radius: 4px;
               }
               .help-nav .btn {
                   margin: 0 3px;
                   min-width: 40px;
                   border-radius: 20px;
                   padding: 0.375rem 0.6rem;
               }
               .help-nav .btn i {
                   font-size: 1rem;
               }
               
               /* Ajuste para melhor proporção em dispositivos móveis */
               @media (max-width: 767.98px) {
                   .help-nav .btn {
                       width: 42px;
                       height: 42px;
                       padding: 0;
                       display: flex;
                       align-items: center;
                       justify-content: center;
                   }
                   .help-nav .btn i {
                       font-size: 1.1rem;
                       margin: 0 !important;
                   }
               }
               
               /* Melhorias para os tabs internos */
               #transaction-tabs {
                   flex-wrap: nowrap;
                   overflow-x: auto;
                   scrollbar-width: thin;
               }
               #transaction-tabs::-webkit-scrollbar {
                   height: 4px;
               }
               #transaction-tabs::-webkit-scrollbar-thumb {
                   background-color: rgba(0,0,0,0.2);
                   border-radius: 4px;
               }
               #transaction-tabs .nav-item {
                   flex-shrink: 0;
               }
               #transaction-tabs .nav-link i {
                   font-size: 0.95rem;
               }
           `;
    document.head.appendChild(styleElement);
    // configura os event listeners para os links do footer
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const linkText = this.textContent.trim();
            let modalId;

            if (linkText.includes('Ajuda')) {
                modalId = 'helpModal';
            } else if (linkText.includes('Sobre')) {
                modalId = 'aboutModal';
            } else if (linkText.includes('Privacidade')) {
                modalId = 'privacyModal';
            }

            if (modalId) {
                const modalElement = document.getElementById(modalId);
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.show();
            }
        });
    });

    // implementar navegação por abas no modal de ajuda
    document.querySelectorAll('.help-nav button').forEach(button => {
        button.addEventListener('click', function () {
            // remove classe ativa de todos os botões
            document.querySelectorAll('.help-nav button').forEach(btn => {
                btn.classList.remove('active');
            });

            // add classe ativa ao botão clicado
            this.classList.add('active');

            // exibe a seção correspondente
            const sectionToShow = this.getAttribute('data-section');
            document.querySelectorAll('.help-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(`${sectionToShow}-section`).style.display = 'block';
        });
    });

    document.getElementById('privacy-accept-btn').addEventListener('click', function (e) {
        // salva a preferência do usuário em localStorage
        localStorage.setItem('privacyAccepted', 'true');
        localStorage.setItem('privacyAcceptedDate', new Date().toISOString());

        // close no modal
        const modalElement = document.getElementById('privacyModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        // exibe confirmação
        Swal.fire({
            icon: 'success',
            title: 'Obrigado!',
            text: 'Obrigado por aceitar nossa política de privacidade!',
            timer: 2000,
            showConfirmButton: false
        });
    });

    // inicializa os tabs dentro das seções de ajuda
    document.addEventListener('shown.bs.modal', function (e) {
        if (e.target.id === 'helpModal') {
            // centraliza na navegação responsiva
            const activeNavBtn = document.querySelector('.help-nav .active');
            if (activeNavBtn) {
                setTimeout(() => {
                    activeNavBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }, 100);
            }

            // tenta inicializar tabs Bootstrap manualmente se necessário
            const transactionTabEls = document.querySelectorAll('#transaction-tabs [data-bs-toggle="tab"]');
            if (transactionTabEls.length > 0) {
                transactionTabEls.forEach(tabEl => {
                    tabEl.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('data-bs-target');

                        // remove classe active de todas as abas e conteúdos
                        document.querySelectorAll('#transaction-tabs .nav-link').forEach(el => {
                            el.classList.remove('active');
                        });
                        document.querySelectorAll('#transaction-content .tab-pane').forEach(el => {
                            el.classList.remove('show', 'active');
                        });

                        // add classe active à aba clicada e seu conteúdo
                        this.classList.add('active');
                        const targetElement = document.querySelector(targetId);
                        targetElement.classList.add('show', 'active');

                        // centraliza a aba selecionada na visualização
                        setTimeout(() => {
                            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }, 100);
                    });
                });
            }
        }
    });
});