import { Auth } from "../services/Auth.js";

// Verificação de autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Função para configurar o checkbox de alteração de senha
function setupPasswordToggle() {
    const changePasswordCheckbox = document.getElementById('changePassword');
    const passwordFields = document.getElementById('passwordFields');
    const passwordInputs = [
        document.getElementById('currentPassword'),
        document.getElementById('newPassword'),
        document.getElementById('confirmPassword')
    ];
    
    // Esconder os campos de senha inicialmente
    passwordFields.style.display = 'none';
    
    // Desabilitar campos de senha inicialmente
    passwordInputs.forEach(field => {
        if (field) field.disabled = true;
    });
    
    // Adicionar listener ao checkbox
    if (changePasswordCheckbox) {
        changePasswordCheckbox.addEventListener('change', function() {
            passwordFields.style.display = this.checked ? 'block' : 'none';
            
            passwordInputs.forEach(field => {
                if (field) field.disabled = !this.checked;
                if (field && !this.checked) field.value = '';
            });
        });
    }
}

// Função para configurar os botões de mostrar/ocultar senha
function setupPasswordVisibilityTogglers() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);
            
            if (passwordField) {
                // Toggle entre type="password" e type="text"
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                // Alternar ícone entre eye e eye-slash
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            }
        });
    });
}

// Função para atualizar os dados do usuário na UI
function updateUserDisplay(user) {
    if (!user) return;
    
    // Atualizar os textos do perfil
    document.getElementById('profileNameDisplay').textContent = user.name || 'Usuário';
    document.getElementById('profileEmailDisplay').textContent = user.email || '';
    
    // Atualizar o avatar
    const userInitials = encodeURIComponent(user.name || 'Usuário');
    document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${userInitials}&background=4e73df&color=fff&size=128&rounded=true`;
    document.getElementById('profileAvatar').alt = `Avatar de ${user.name || 'Usuário'}`;
    
    // Atualizar os campos do formulário
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
}

// Função para configurar o formulário de edição de perfil
function setupProfileForm() {
    const form = document.getElementById('editProfileForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('profileName');
        const name = nameInput.value.trim();
        const changePasswordCheckbox = document.getElementById('changePassword');
        
        if (!name) {
            Swal.fire({
                title: 'Erro',
                text: 'Por favor, informe seu nome.',
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return;
        }
        
        try {
            Swal.fire({
                title: 'Atualizando...',
                text: 'Salvando suas informações',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const userData = {
                name: name,
                updatedAt: new Date()
            };
            
            // Verificar se a senha deve ser alterada
            if (changePasswordCheckbox && changePasswordCheckbox.checked) {
                const currentPasswordField = document.getElementById('currentPassword');
                const newPasswordField = document.getElementById('newPassword');
                const confirmPasswordField = document.getElementById('confirmPassword');
                
                const currentPassword = currentPasswordField.value;
                const newPassword = newPasswordField.value;
                const confirmPassword = confirmPasswordField.value;
                
                // Validar os campos de senha
                if (!currentPassword) {
                    throw new Error('A senha atual é obrigatória');
                }
                
                if (!newPassword) {
                    throw new Error('A nova senha é obrigatória');
                }
                
                if (newPassword.length < 6) {
                    throw new Error('A nova senha deve ter pelo menos 6 caracteres');
                }
                
                if (newPassword !== confirmPassword) {
                    throw new Error('As senhas não conferem');
                }
                
                // Atualizar a senha
                try {
                    await Auth.updatePassword(currentPassword, newPassword);
                } catch (passwordError) {
                    // Fechar o SweetAlert de "Atualizando..."
                    Swal.close();
                    
                    // Verificar se é um erro de credenciais inválidas
                    if (passwordError.message.includes('Senha atual incorreta') || 
                        passwordError.message.includes('invalid-login-credentials') ||
                        passwordError.code === 'auth/invalid-login-credentials' ||
                        passwordError.code === 'auth/wrong-password') {
                        
                        // Adiciona a classe de erro ao campo de senha atual
                        currentPasswordField.classList.add('is-invalid');
                        
                        // Cria ou atualiza elemento de feedback de erro
                        let feedbackElement = document.getElementById('currentPassword-feedback');
                        if (!feedbackElement) {
                            feedbackElement = document.createElement('div');
                            feedbackElement.id = 'currentPassword-feedback';
                            feedbackElement.className = 'invalid-feedback';
                            currentPasswordField.parentNode.appendChild(feedbackElement);
                        }
                        
                        // Foca no campo para correção
                        currentPasswordField.focus();
                        
                        // Limpa o campo de senha atual
                        currentPasswordField.value = '';
                        
                        // Adiciona evento para remover o erro quando o usuário começa a digitar novamente
                        currentPasswordField.addEventListener('input', function onInput() {
                            currentPasswordField.classList.remove('is-invalid');
                            if (feedbackElement) {
                                feedbackElement.textContent = '';
                            }
                            currentPasswordField.removeEventListener('input', onInput);
                        });
                        
                        // Exibir notificação SweetAlert para senha incorreta
                        Swal.fire({
                            title: 'Senha Incorreta',
                            text: 'A senha atual que você digitou está incorreta. Por favor, tente novamente.',
                            icon: 'error',
                            timer: 3000,                // Definir timer para 3 segundos
                            timerProgressBar: true,     // Mostrar barra de progresso
                            showConfirmButton: false    // Remover botão de confirmação
                        });
                        
                        // Retornar sem lançar erro
                        return;
                    }
                    
                    // Se for outro tipo de erro, repassar
                    throw passwordError;
                }
            }
            
            // Atualizar o perfil
            await Auth.updateUserProfile(userData);
            
            // Atualizar a interface
            updateUserDisplay({
                ...Auth.getLoggedInUser(),
                name: name
            });
            
            // Atualizar os elementos da UI que exibem o nome do usuário
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = name;
            });
            
            Swal.fire({
                title: 'Sucesso!',
                text: 'Perfil atualizado com sucesso',
                icon: 'success',
                timer: 3000,               // Alterado para 3 segundos
                timerProgressBar: true,    // Adicionado barra de progresso 
                showConfirmButton: false
            });
            
        } catch (error) {
            // Verificar se o SweetAlert ainda está aberto antes de fechá-lo
            if (Swal.isVisible()) {
                Swal.close();
            }
            
            // Configuração padronizada para todos os alertas de erro
            Swal.fire({
                title: 'Erro',
                text: error.message || 'Não foi possível atualizar o perfil. Tente novamente.',
                icon: 'error',
                timer: 3000,                // Definir timer para 3 segundos
                timerProgressBar: true,     // Mostrar barra de progresso
                showConfirmButton: false    // Remover botão de confirmação
            });
        }
    });
}

// Função para configurar as ações da conta do usuário
function setupUserAccountActions() {
    // Configuração para logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
    
    // Configuração para excluir conta
    const deleteAccountButton = document.getElementById('delete-account-button');
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            showDeleteAccountConfirmation();
        });
    }
}

// Função para mostrar confirmação de exclusão de conta
function showDeleteAccountConfirmation() {
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
                await Auth.deleteUserAccount();
                window.location.href = 'login.html';
            } catch (error) {
                Swal.fire({
                    title: 'Erro',
                    text: 'Não foi possível excluir sua conta. Tente novamente.',
                    icon: 'error',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.getLoggedInUser();
    updateUserDisplay(user);
    setupPasswordToggle();
    setupPasswordVisibilityTogglers();
    setupProfileForm();
    setupUserAccountActions();
});