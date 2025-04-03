/**
 * Script para controlar os modais do footer
 * Implementa funcionalidades interativas para os links do rodapé
 */
document.addEventListener('DOMContentLoaded', function () {
    // Criar os modais dinamicamente
    const modalsHTML = `
    <!-- Modal de Ajuda -->
    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="helpModalLabel"><i class="fas fa-question-circle me-2"></i>Manual de Ajuda</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-center mb-4">
                        <div class="btn-group help-nav" role="group" aria-label="Navegação de ajuda">
                            <button type="button" class="btn btn-outline-primary active" data-section="inicio">Início</button>
                            <button type="button" class="btn btn-outline-primary" data-section="transacoes">Transações</button>
                            <button type="button" class="btn btn-outline-primary" data-section="metas">Metas</button>
                            <button type="button" class="btn btn-outline-primary" data-section="relatorios">Relatórios</button>
                            <button type="button" class="btn btn-outline-primary" data-section="conta">Sua Conta</button>
                        </div>
                    </div>

                    <div class="help-content">
                        <!-- Seção Início -->
                        <div class="help-section mb-4 active" id="inicio-section">
                            <h4><i class="fas fa-home me-2"></i>Página Inicial</h4>
                            <p>A página inicial do FinTracker apresenta uma visão geral das suas finanças. Aqui você poderá visualizar:</p>
                            <ul>
                                <li>Saldo atual</li>
                                <li>Resumo de receitas e gastos</li>
                                <li>Progresso de suas metas</li>
                                <li>Gráficos de transações recentes</li>
                            </ul>
                            <div class="text-center mt-3 mb-3">
                                <img src="/src/assets/images/help/dashboard-example.jpg" alt="Exemplo de Dashboard" class="img-fluid rounded shadow-sm border" style="max-height: 300px;">
                            </div>
                            <p>O gráfico principal mostra a distribuição dos seus gastos por categoria, permitindo identificar rapidamente os principais focos de despesas.</p>
                        </div>
                        
                        <!-- Seção Transações - ATUALIZADA -->
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
                                        <i class="fas fa-sync-alt me-2"></i> Todas as suas transações são armazenadas com segurança e sincronizadas automaticamente entre seus dispositivos.
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
                                    <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories-content" type="button" role="tab">
                                        <i class="fas fa-tags text-primary me-2"></i>Categorias
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
                                                <strong>Dica:</strong> Os gastos são automaticamente considerados nos relatórios assim que você os adiciona, sem necessidade de sincronização manual.
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
                                                <strong>Dica:</strong> Ao registrar receitas recorrentes (como salário), você pode copiar uma transação existente e apenas alterar a data para poupar tempo.
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
                                                                <li>Um novo campo aparecerá para você digitar o nome da categoria</li>
                                                                <li>A nova categoria estará disponível para uso futuro</li>
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
                                                <i class="fas fa-info-circle me-2"></i> <strong>Importante:</strong> Categorizar corretamente suas transações é fundamental para obter relatórios precisos e análises financeiras úteis.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Seção Metas - ATUALIZADA -->
                        <div class="help-section mb-4" id="metas-section" style="display: none;">
                            <h4 class="d-flex align-items-center mb-3">
                                <i class="fas fa-bullseye me-2"></i>Planejamento de Metas
                                <span class="badge bg-primary ms-2 fs-6">Atualizado</span>
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
                        
                        <!-- Seção Relatórios - MELHORADA E ATUALIZADA -->
                        <div class="help-section mb-4" id="relatorios-section" style="display: none;">
                            <h4 class="d-flex align-items-center">
                                <i class="fas fa-chart-pie me-2"></i>Relatórios Financeiros
                                <span class="badge bg-primary ms-2 fs-6">Atualizado</span>
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
                                                            <td>15/07/2023</td>
                                                            <td>Salário</td>
                                                            <td><span class="text-success">R$ 3.500,00</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>10/07/2023</td>
                                                            <td>Aluguel</td>
                                                            <td><span class="text-danger">R$ 1.200,00</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>05/07/2023</td>
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
                        
                        <!-- Seção Conta - ATUALIZADA -->
                        <div class="help-section" id="conta-section" style="display: none;">
                            <h4 class="d-flex align-items-center mb-3">
                                <i class="fas fa-user-circle me-2"></i>Sua Conta
                                <span class="badge bg-primary ms-2 fs-6">Atualizado</span>
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
                                                <li>Confirme sua decisão na janela de confirmação</li>
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
                            
                            <div class="alert alert-info mt-4 d-flex">
                                <div class="me-3 fs-4">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <div>
                                    <h5 class="alert-heading">Recursos em desenvolvimento</h5>
                                    <p>Estamos trabalhando em novas funcionalidades para o menu "Sua Conta", incluindo:</p>
                                    <ul class="mb-0">
                                        <li>Edição de informações de perfil</li>
                                        <li>Alteração de senha</li>
                                        <li>Personalização da interface</li>
                                        <li>Configurações de notificações</li>
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
                    <a href="#" class="btn btn-primary" id="help-download-pdf"><i class="fas fa-file-pdf me-2"></i>Baixar Manual Completo</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Sobre -->
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
                            <li>Registrar receitas e despesas</li>
                            <li>Categorizar transações automaticamente</li>
                            <li>Criar e monitorar orçamentos mensais</li>
                            <li>Gerar relatórios e gráficos detalhados</li>
                            <li>Receber alertas para pagamentos programados</li>
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
                                        <p class="card-text">Organize suas despesas em categorias personalizáveis para análises mais precisas.</p>
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
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <a href="#" class="btn btn-info text-white" id="contact-team-btn"><i class="fas fa-envelope me-2"></i>Contatar Equipe</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Privacidade -->
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
                        <div class="text-center mt-4">
                            <button type="button" class="btn btn-outline-danger" id="request-data-btn">
                                <i class="fas fa-download me-2"></i>Solicitar Meus Dados
                            </button>
                            <button type="button" class="btn btn-outline-secondary ms-2" id="delete-data-btn">
                                <i class="fas fa-trash-alt me-2"></i>Solicitar Exclusão de Dados
                            </button>
                        </div>
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

    // Adicionar os modais ao final do body
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    // Configurar os event listeners para os links do footer
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

    // Implementar navegação por abas no modal de ajuda
    document.querySelectorAll('.help-nav button').forEach(button => {
        button.addEventListener('click', function () {
            // Remover classe ativa de todos os botões
            document.querySelectorAll('.help-nav button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Adicionar classe ativa ao botão clicado
            this.classList.add('active');

            // Mostrar a seção correspondente
            const sectionToShow = this.getAttribute('data-section');
            document.querySelectorAll('.help-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(`${sectionToShow}-section`).style.display = 'block';
        });
    });

    // Configurar o botão de download do manual em PDF
    document.getElementById('help-download-pdf').addEventListener('click', function (e) {
        e.preventDefault();
        // Simular o download do PDF
        alert('O manual completo será baixado em breve. Por favor, aguarde...');
        // Em um cenário real, aqui você redirecionaria para um endpoint que geraria o PDF
    });

    // Configurar o botão de contato com a equipe
    document.getElementById('contact-team-btn').addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = 'mailto:suporte@fintracker.com?subject=Contato%20FinTracker';
    });

    // Configurar botões da seção de privacidade
    document.getElementById('request-data-btn').addEventListener('click', function (e) {
        e.preventDefault();
        // Em um sistema real, isso abriria um formulário de solicitação de dados
        alert('Esta funcionalidade enviará seus dados pessoais para o e-mail cadastrado após verificação de segurança.');
    });

    document.getElementById('delete-data-btn').addEventListener('click', function (e) {
        e.preventDefault();
        // Em um sistema real, isso abriria um formulário de confirmação de exclusão
        alert('Atenção! Esta ação não pode ser desfeita. Você receberá um e-mail com instruções para confirmar a exclusão dos seus dados.');
    });

    document.getElementById('privacy-accept-btn').addEventListener('click', function (e) {
        // Salvar a preferência do usuário em localStorage
        localStorage.setItem('privacyAccepted', 'true');
        localStorage.setItem('privacyAcceptedDate', new Date().toISOString());

        // Fechar o modal
        const modalElement = document.getElementById('privacyModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        // Mostrar confirmação
        alert('Obrigado por aceitar nossa política de privacidade!');
    });

    // Inicializar os tabs dentro das seções de ajuda
    document.addEventListener('shown.bs.modal', function (e) {
        if (e.target.id === 'helpModal') {
            // Tentar inicializar tabs Bootstrap manualmente se necessário
            const transactionTabEls = document.querySelectorAll('#transaction-tabs [data-bs-toggle="tab"]');
            if (transactionTabEls.length > 0) {
                transactionTabEls.forEach(tabEl => {
                    tabEl.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('data-bs-target');

                        // Remover classe active de todas as abas e conteúdos
                        document.querySelectorAll('#transaction-tabs .nav-link').forEach(el => {
                            el.classList.remove('active');
                        });
                        document.querySelectorAll('#transaction-content .tab-pane').forEach(el => {
                            el.classList.remove('show', 'active');
                        });

                        // Adicionar classe active à aba clicada e seu conteúdo
                        this.classList.add('active');
                        document.querySelector(targetId).classList.add('show', 'active');
                    });
                });
            }
        }
    });
});