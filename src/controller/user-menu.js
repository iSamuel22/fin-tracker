import { Auth } from "../services/Auth.js";
import { FirestoreService } from "../services/FirestoreService.js";

// Função para setup completo do menu de usuário
export function setupUserMenu() {
    // Verificar autenticação
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Configurar ações da conta
    setupUserAccountActions();
    
    // Atualizar informações do usuário no menu
    updateUserInfo();
    
    console.log("Menu do usuário configurado com sucesso");
}

// Exportar a função para que possa ser importada em outros arquivos
export function setupUserAccountActions() {
    // Configuração para logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
        console.log("Logout button event listener added");
    } else {
        console.warn("Logout button not found");
    }
    
    // Configuração para excluir conta
    const deleteAccountButton = document.getElementById('delete-account-button');
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            showDeleteAccountConfirmation();
        });
        console.log("Delete account button found and configured");
    } else {
        console.warn("Delete account button not found");
    }
}

// Função para atualizar as informações do usuário no menu
function updateUserInfo() {
    try {
        const user = Auth.getLoggedInUser();
        if (!user) return;

        // Atualiza o nome do usuário na barra de navegação
        const userMenuName = document.querySelector('#userMenu span.d-none.d-md-inline');
        if (userMenuName) {
            userMenuName.textContent = user.name || 'Usuário';
        }

        // Atualiza avatar com as iniciais do usuário real
        const userInitials = user.name ? encodeURIComponent(user.name) : 'Usuario';
        const avatarUrls = document.querySelectorAll('.user-avatar');
        avatarUrls.forEach(avatar => {
            const isMobile = avatar.width < 64;
            avatar.src = `https://ui-avatars.com/api/?name=${userInitials}&background=4e73df&color=fff&rounded=true${!isMobile ? '&size=64' : ''}`;
            avatar.alt = `Avatar de ${user.name || 'Usuário'}`;
        });

        // Atualiza informações no dropdown
        const userNameElement = document.querySelector('.user-info .user-name');
        if (userNameElement) {
            userNameElement.textContent = user.name || 'Usuário';
        }

        const userEmailElement = document.querySelector('.user-info .user-email');
        if (userEmailElement) {
            userEmailElement.textContent = user.email || '';
        }
        
        // Configurar link de perfil para armazenar página atual
        configurarLinkPerfil();
    } catch (error) {
        console.error("Erro ao atualizar informações do usuário:", error);
    }
}

// Função para configurar o link de perfil
function configurarLinkPerfil() {
    const profileLink = document.querySelector('.dropdown-item[href="profile.html"]');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            // Armazenar a página atual no localStorage
            const currentPage = window.location.pathname;
            localStorage.setItem('returnPage', currentPage);
            console.log(`Página de retorno definida: ${currentPage}`);
        });
    }
}

// Função de logout direta
function logoutUser() {
    try {
        console.log("Executando logout direto");
        localStorage.removeItem('loggedInUser');

        // Limpar outros dados de sessão se necessário
        const user = Auth.getLoggedInUser();
        if (user && user.email) {
            cleanupLocalStorage(user.email);
        }

        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro no logout direto:", error);
        // Força redirecionamento em caso de erro
        window.location.href = 'login.html';
    }
}

// Função para mostrar confirmação de exclusão de conta
function showDeleteAccountConfirmation() {
    // Verificar se Swal está disponível
    if (typeof Swal === 'undefined') {
        console.error("SweetAlert2 não está disponível");
        alert("Erro: biblioteca de diálogos não carregada. Por favor, recarregue a página.");
        return;
    }

    // Primeiro diálogo: confirmação inicial e solicitação de senha
    Swal.fire({
        title: 'Confirmar exclusão de conta',
        html: `
            <p class="text-danger fw-bold">Esta ação é irreversível!</p>
            <p>Por favor, digite sua senha para confirmar a exclusão da sua conta.</p>
            <div class="form-group">
                <input type="password" id="password" class="swal2-input" placeholder="Digite sua senha">
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Verificar',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: () => {
            const password = Swal.getPopup().querySelector('#password').value;
            if (!password) {
                Swal.showValidationMessage('Por favor, digite sua senha');
                return false;
            }
            return password;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const password = result.value;
            
            // Verificar a senha antes de prosseguir
            verifyPasswordAndProceed(password);
        }
    });
}

// Função para verificar senha e prosseguir com a exclusão
async function verifyPasswordAndProceed(password) {
    try {
        Swal.fire({
            title: 'Verificando...',
            text: 'Verificando sua senha',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const user = Auth.getLoggedInUser();
        if (!user || !user.email) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar a senha usando o Auth
        const isPasswordValid = await Auth.verifyPassword(user.email, password);
        
        if (!isPasswordValid) {
            Swal.fire({
                title: 'Senha incorreta',
                text: 'A senha informada está incorreta',
                icon: 'error',
                confirmButtonText: 'Tentar novamente'
            });
            return;
        }

        // Se a senha estiver correta, mostrar confirmação final
        showFinalConfirmation(password);
    } catch (error) {
        console.error('Erro ao verificar senha:', error);
        Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro ao verificar sua senha. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Função para mostrar confirmação final
function showFinalConfirmation(password) {
    Swal.fire({
        title: 'Excluir Conta',
        html: `
            <p>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</p>
            <p class="text-danger fw-bold">Todos os seus dados serão permanentemente excluídos:</p>
            <ul class="text-start">
                <li>Gastos</li>
                <li>Receitas</li>
                <li>Metas</li>
            </ul>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-trash me-2"></i>Sim, excluir minha conta',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Excluindo conta...',
                    text: 'Por favor, aguarde enquanto excluímos sua conta.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Deleta conta do usuário com a senha verificada
                await deleteUserAccount(password);

                Swal.fire({
                    title: 'Conta Excluída',
                    text: 'Sua conta foi excluída com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'login.html';
                });
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Ocorreu um erro ao excluir sua conta: ' + (error.message || 'Tente novamente mais tarde'),
                    icon: 'error',
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        }
    });
}

// Função para excluir conta
async function deleteUserAccount(password) {
    const user = Auth.getLoggedInUser();
    if (!user || !user.uid) {
        throw new Error('Usuário não encontrado');
    }

    try {
        console.log("Iniciando processo de exclusão de conta");

        const userId = user.uid;
        const userEmail = user.email;

        console.log("Excluindo usuário do Firebase Authentication");
        await Auth.deleteUserAccount(password);

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

// Função para limpar dados do localStorage
function cleanupLocalStorage(userEmail) {
    if (!userEmail) return;

    const prefixes = ['gastos_', 'receitas_', 'metas_', 'configuracoes_'];

    prefixes.forEach(prefix => {
        localStorage.removeItem(`${prefix}${userEmail}`);
    });

    localStorage.removeItem('loggedInUser');
}