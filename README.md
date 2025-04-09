# **FinTracker - Sistema de Gestão Financeira Pessoal**

O FinTracker é um aplicativo web de gestão financeira pessoal projetado para ajudar os usuários a controlar suas despesas, receitas, definir metas financeiras e visualizar relatórios detalhados sobre sua saúde financeira. Desenvolvido com tecnologias web modernas, o sistema oferece uma interface intuitiva e responsiva que funciona em qualquer dispositivo.

## **📋 Funcionalidades**

### Dashboard
* Visão geral da saúde financeira com métricas-chave e visualizações
* Resumo de saldo, receitas e despesas
* Visualização das metas financeiras mais recentes e seu progresso

### Gestão de Transações
* **Gastos**: Registre e categorize suas despesas com informações detalhadas
* **Receitas**: Acompanhe todas as fontes de renda com categorização
* **Sistema de Filtros**: Filtragem avançada por texto, período e categoria
* **Categorias Personalizadas**: Crie suas próprias categorias para melhor organização

### Metas Financeiras
* Defina objetivos financeiros com valores e descrições
* Visualize estimativas automáticas de tempo para alcançar cada meta
* Monitore o progresso de cada meta com base no seu saldo mensal

### Relatórios e Análise
* Gráficos interativos de receitas x despesas
* Análise de gastos por categoria
* Comparativo mensal de transações
* Tabela detalhada de todas as transações do período

### Perfil de Usuário
* Edição de informações pessoais
* Alteração segura de senha com indicador de força
* Opções de exclusão de conta

## **🚀 Tecnologias Utilizadas**
* **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
* **Visualização de Dados**: Chart.js
* **Autenticação e Banco de Dados**: Firebase Authentication e Firestore
* **Alertas e Notificações**: SweetAlert2
* **Ícones**: Font Awesome 6

## **🛡️ Recursos de Segurança**
* Autenticação segura com Firebase
* Criptografia de dados sensíveis
* Sistema robusto de gerenciamento de senhas
* Proteção contra perda de dados com sincronização

## **💻 Instalação e Uso**

### Pré-requisitos
* Node.js instalado (versão recomendada: 14.x ou superior)
* Conta Firebase (para autenticação e armazenamento de dados)

### Configuração
1. Clone o repositório:
```
git clone https://github.com/iSamuel22/FinTracker.git
cd FinTracker
```

2. Configure o Firebase:
   * Crie um projeto no Console do Firebase
   * Ative o Authentication (com email/senha) e o Firestore
   * Copie suas credenciais do Firebase para o arquivo de configuração

3. Inicie um servidor local:
```
# Usando extensão Live Server no VS Code
# Ou usando http-server
npx http-server
```

4. Acesse a aplicação em seu navegador:
```
http://localhost:8080
```

## **📱 Responsividade**
O FinTracker foi projetado para funcionar perfeitamente em qualquer dispositivo:
* Layout adaptável que se ajusta automaticamente a telas de diferentes tamanhos
* Menus compactos para dispositivos móveis
* Tabelas responsivas que reorganizam os dados em telas pequenas
* Componentes de interface otimizados para touch em dispositivos móveis

## **🔄 Fluxo de Utilização**
1. **Registro/Login**: Crie uma conta ou acesse com suas credenciais existentes
2. **Dashboard**: Visualize o resumo da sua situação financeira
3. **Gerenciamento de Transações**:
   * Adicione suas receitas e despesas com categorias apropriadas
   * Use filtros para analisar padrões específicos
4. **Metas**: Defina objetivos financeiros e acompanhe seu progresso
5. **Relatórios**: Analise seus dados financeiros por diferentes períodos e categorias

## **📝 Estrutura do Projeto**
```
FinTracker/
├── index.html                 # Página inicial
├── src/
│   ├── assets/                # Recursos estáticos
│   │   └── favicon.ico        # Ícone do site
│   ├── config/                # Configurações
│   │   └── firebase.js        # Configuração do Firebase
│   ├── controller/            # Controladores da aplicação
│   │   ├── dashboard.js       # Lógica do dashboard
│   │   ├── gastos.js          # Gerenciamento de gastos
│   │   ├── receitas.js        # Gerenciamento de receitas
│   │   ├── metas.js           # Gerenciamento de metas
│   │   ├── relatorio.js       # Geração de relatórios
│   │   ├── profile.js         # Gerenciamento de perfil
│   │   ├── user-menu.js       # Menu de usuário
│   │   └── footer-modals.js   # Modais de rodapé
│   ├── css/                   # Folhas de estilo
│   │   ├── styles.css         # Estilo principal
│   │   ├── filters.css        # Estilos de filtros
│   │   └── footer.css         # Estilos do rodapé
|   |   └── safe.css           # Estilo auxiliar
│   ├── model/                 # Modelos de dados
│   │   ├── CategoriaGasto.js  # Modelo de categoria de gasto
│   │   ├── CategoriaReceita.js # Modelo de categoria de receita
│   │   ├── Cliente.js         # Modelo de cliente/usuário
│   │   ├── Gasto.js           # Modelo de gasto
│   │   ├── Meta.js            # Modelo de meta financeira
│   │   └── Receita.js         # Modelo de receita
│   ├── services/              # Serviços
│   │   ├── Auth.js            # Serviço de autenticação
│   │   └── FirestoreService.js # Serviço de banco de dados
│   ├── utils/                 # Utilitários
│   │   └── tableResponsive.js # Helper para tabelas responsivas
│   └── view/                  # Páginas HTML
│       ├── dashboard.html     # Página de dashboard
│       ├── gastos.html        # Página de gastos
│       ├── receitas.html      # Página de receitas
│       ├── metas.html         # Página de metas
│       ├── relatorio.html     # Página de relatórios
│       ├── profile.html       # Página de perfil
│       ├── login.html         # Página de login
│       └── registro.html      # Página de registro
```

## **🤝 Contribuição**
Contribuições são bem-vindas! Sinta-se à vontade para:
1. Reportar bugs
2. Sugerir novos recursos
3. Enviar pull requests

## **📜 Licença**
Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## **📞 Contato**
Para qualquer dúvida sobre o projeto, entre em contato:
* E-mail: samueljubim47@gmail.com
* GitHub: iSamuel22
