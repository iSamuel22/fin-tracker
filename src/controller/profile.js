import { Auth } from "../services/Auth.js";

// verificação de autenticação
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// configura o checkbox de alteração de senha
function setupPasswordToggle() {
    const changePasswordCheckbox = document.getElementById('changePassword');
    const passwordFields = document.getElementById('passwordFields');
    const passwordInputs = [
        document.getElementById('currentPassword'),
        document.getElementById('newPassword'),
        document.getElementById('confirmPassword')
    ];

    // esconde os campos de senha inicialmente
    passwordFields.style.display = 'none';

    // desabilita campos de senha inicialmente
    passwordInputs.forEach(field => {
        if (field) field.disabled = true;
    });

    // add listener ao checkbox
    if (changePasswordCheckbox) {
        changePasswordCheckbox.addEventListener('change', function () {
            passwordFields.style.display = this.checked ? 'block' : 'none';

            passwordInputs.forEach(field => {
                if (field) field.disabled = !this.checked;
                if (field && !this.checked) field.value = '';
            });
        });
    }
}

// configura os botões de mostrar/ocultar senha
function setupPasswordVisibilityTogglers() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);

            if (passwordField) {
                // toggle entre type="password" e type="text"
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);

                // alterna ícone entre eye e eye-slash
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            }
        });
    });
}

// configura o indicador de força da senha
function setupPasswordStrengthIndicator() {
    const newPasswordInput = document.getElementById('newPassword');
    const progressBar = document.querySelector('.password-strength .progress-bar');
    const strengthLabel = document.querySelector('.password-strength-label');

    if (newPasswordInput && progressBar && strengthLabel) {
        newPasswordInput.addEventListener('input', function () {
            const password = this.value;
            let strength = 0;

            // critérios de força da senha
            if (password.length >= 8) strength += 20;
            if (password.match(/[a-z]+/)) strength += 20;
            if (password.match(/[A-Z]+/)) strength += 20;
            if (password.match(/[0-9]+/)) strength += 20;
            if (password.match(/[^a-zA-Z0-9]+/)) strength += 20;

            // atualiza barra de progresso
            progressBar.style.width = strength + '%';

            // atualiza classe e texto conforme a força
            if (strength < 40) {
                progressBar.className = 'progress-bar bg-danger';
                strengthLabel.textContent = 'Fraca';
                strengthLabel.className = 'password-strength-label text-danger';
            } else if (strength < 80) {
                progressBar.className = 'progress-bar bg-warning';
                strengthLabel.textContent = 'Média';
                strengthLabel.className = 'password-strength-label text-warning';
            } else {
                progressBar.className = 'progress-bar bg-success';
                strengthLabel.textContent = 'Forte';
                strengthLabel.className = 'password-strength-label text-success';
            }
        });
    }
}

// atualiza os dados do usuário na UI
function updateUserDisplay(user) {
    if (!user) return;

    // atualiza os textos do perfil
    document.getElementById('profileNameDisplay').textContent = user.name || 'Usuário';
    document.getElementById('profileEmailDisplay').textContent = user.email || '';

    // atualiza o avatar
    const userInitials = encodeURIComponent(user.name || 'Usuário');
    document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${userInitials}&background=4e73df&color=fff&size=128&rounded=true`;
    document.getElementById('profileAvatar').alt = `Avatar de ${user.name || 'Usuário'}`;

    // atualiza os campos do formulário
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
}

// configura o formulário de edição de perfil
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

            // verifica se a senha deve ser alterada
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

                // atualiza a senha
                try {
                    await Auth.updatePassword(currentPassword, newPassword);
                } catch (passwordError) {
                    // fecha o SweetAlert de "Atualizando..."
                    Swal.close();

                    // verifica se é um erro de credenciais inválidas
                    if (passwordError.message.includes('Senha atual incorreta') ||
                        passwordError.message.includes('invalid-login-credentials') ||
                        passwordError.code === 'auth/invalid-login-credentials' ||
                        passwordError.code === 'auth/wrong-password') {

                        // add a classe de erro ao campo de senha atual
                        currentPasswordField.classList.add('is-invalid');

                        // cria ou atualiza elemento de feedback de erro
                        let feedbackElement = document.getElementById('currentPassword-feedback');
                        if (!feedbackElement) {
                            feedbackElement = document.createElement('div');
                            feedbackElement.id = 'currentPassword-feedback';
                            feedbackElement.className = 'invalid-feedback';
                            currentPasswordField.parentNode.appendChild(feedbackElement);
                        }

                        // foca no campo para correção
                        currentPasswordField.focus();

                        // limpa o campo de senha atual
                        currentPasswordField.value = '';

                        // add evento para remover o erro quando o usuário começa a digitar novamente
                        currentPasswordField.addEventListener('input', function onInput() {
                            currentPasswordField.classList.remove('is-invalid');
                            if (feedbackElement) {
                                feedbackElement.textContent = '';
                            }
                            currentPasswordField.removeEventListener('input', onInput);
                        });

                        // exibe notificação SweetAlert para senha incorreta
                        Swal.fire({
                            title: 'Senha Incorreta',
                            text: 'A senha atual que você digitou está incorreta. Por favor, tente novamente.',
                            icon: 'error',
                            timer: 3000,                // define timer para 3 segundos
                            timerProgressBar: true,     // mostra barra de progresso
                            showConfirmButton: false    // remove botão de confirmação
                        });

                        // retorna sem lançar erro
                        return;
                    }

                    // se for outro tipo de erro, repassar
                    throw passwordError;
                }
            }

            // atualiza o perfil
            await Auth.updateUserProfile(userData);

            // atualiza a interface
            updateUserDisplay({
                ...Auth.getLoggedInUser(),
                name: name
            });

            // atualiza os elementos da UI que exibem o nome do usuário
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = name;
            });

            Swal.fire({
                title: 'Sucesso!',
                text: 'Perfil atualizado com sucesso',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                // verifica se há uma página para retornar
                const returnPage = localStorage.getItem('returnPage');
                if (returnPage && returnPage !== '/src/view/profile.html') {
                    // limpa o returnPage do localStorage
                    localStorage.removeItem('returnPage');
                    // redireciona para a página de origem
                    window.location.href = returnPage;
                }
            });

        } catch (error) {
            // verifica se o SweetAlert ainda está aberto antes de fechá-lo
            if (Swal.isVisible()) {
                Swal.close();
            }

            // configuração padronizada para todos os alertas de erro
            Swal.fire({
                title: 'Erro',
                text: error.message || 'Não foi possível atualizar o perfil. Tente novamente.',
                icon: 'error',
                timer: 3000,                // define timer para 3 segundos
                timerProgressBar: true,     // mostra barra de progresso
                showConfirmButton: false    // remove botão de confirmação
            });
        }
    });
}

// configura o botão de cancelar para voltar à página anterior
function setupCancelButton() {
    const cancelButton = document.querySelector('a.btn-secondary[href="dashboard.html"]');
    if (cancelButton) {
        // add classe para centralização específica
        cancelButton.classList.add('profile-btn-back');

        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();
            const returnPage = localStorage.getItem('returnPage');
            if (returnPage && returnPage !== '/src/view/profile.html') {
                localStorage.removeItem('returnPage');
                window.location.href = returnPage;
            } else {
                window.location.href = 'dashboard.html';
            }
        });

        // atualiza o texto do botão se houver uma página para retornar
        const returnPage = localStorage.getItem('returnPage');
        if (returnPage) {
            const pageName = returnPage.split('/').pop().replace('.html', '');
            if (pageName) {
                // verifica a largura da janela e define o texto apropriado
                if (window.innerWidth < 576) {
                    // usa <span> para melhor controle de centralização
                    cancelButton.innerHTML = `<i class="fas fa-arrow-left"></i><span>Voltar</span>`;
                } else {
                    cancelButton.textContent = `Voltar para ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
                }

                // add um listener de redimensionamento para atualizar o texto quando o tamanho da tela mudar
                window.addEventListener('resize', function () {
                    if (window.innerWidth < 576) {
                        cancelButton.innerHTML = `<i class="fas fa-arrow-left"></i><span>Voltar</span>`;
                    } else {
                        cancelButton.textContent = `Voltar para ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
                    }
                });
            }
        }
    }
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.getLoggedInUser();
    updateUserDisplay(user);
    setupPasswordToggle();
    setupPasswordVisibilityTogglers();
    setupPasswordStrengthIndicator();
    setupProfileForm();
    setupCancelButton();

    // se esta é a primeira vez que a página de perfil é carregada e não há página de retorno definida,
    // definir a página atual como página de retorno (dashboard)
    if (!localStorage.getItem('returnPage')) {
        localStorage.setItem('returnPage', '/src/view/dashboard.html');
    }
});