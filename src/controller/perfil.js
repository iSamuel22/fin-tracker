// import { Auth } from "../services/Auth.js";
// import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { FirestoreService } from "../services/FirestoreService.js";

// // carregamento dinâmico do SweetAlert2
// let Swal;
// async function loadSweetAlert() {
//     try {
//         const module = await import('https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm');
//         Swal = module.default;
//         return Swal;
//     } catch (error) {
//         console.error("Erro ao carregar SweetAlert:", error);
//         // fallback para alert padrão caso o SweetAlert falhe
//         return {
//             fire: (config) => {
//                 alert(config.title + "\n\n" + config.text);
//                 return Promise.resolve();
//             }
//         };
//     }
// }

// // inicializa menu do usuário
// async function initUserMenu() {
//     try {
//         const user = Auth.getLoggedInUser();
//         if (!user) {
//             window.location.href = 'login.html';
//             return;
//         }

//         // Define os elementos do menu de usuário na navbar
//         const userMenuToggle = document.getElementById('userMenu');
//         if (userMenuToggle) {
//             // Adiciona avatar e nome
//             userMenuToggle.innerHTML = `
//                 <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4e73df&color=fff&rounded=true" 
//                      alt="Avatar" class="user-avatar">
//                 <span class="user-name d-none d-md-inline">${user.name}</span>
//             `;
//         }

//         // Preenche o dropdown menu
//         const dropdownMenu = document.querySelector('.dropdown-menu-user');
//         if (dropdownMenu) {
//             dropdownMenu.innerHTML = `
//                 <li class="dropdown-header-user">
//                     <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4e73df&color=fff&size=64&rounded=true" 
//                          alt="Avatar" class="dropdown-header-avatar">
//                     <div class="user-info">
//                         <div class="user-info-name">${user.name}</div>
//                         <div class="user-info-email">${user.email}</div>
//                     </div>
//                 </li>
//                 <li><hr class="dropdown-divider-user"></li>
//                 <li>
//                     <a class="dropdown-item dropdown-item-user active" href="editar-perfil.html">
//                         <span class="icon"><i class="fas fa-user-edit"></i></span>
//                         <span>Editar Perfil</span>
//                     </a>
//                 </li>
//                 <li>
//                     <a class="dropdown-item dropdown-item-user" href="#" id="logout-button">
//                         <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
//                         <span>Sair</span>
//                     </a>
//                 </li>
//                 <li><hr class="dropdown-divider-user"></li>
//                 <li class="danger-zone">
//                     <a class="dropdown-item dropdown-item-user danger-item" href="#" id="delete-account-button">
//                         <span class="icon"><i class="fas fa-trash"></i></span>
//                         <span>Excluir Conta</span>
//                     </a>
//                 </li>
//             `;

//             // Configura botão de logout
//             const logoutButton = document.getElementById('logout-button');
//             if (logoutButton) {
//                 logoutButton.addEventListener('click', (e) => {
//                     e.preventDefault();
//                     Auth.logout();
//                 });
//             }

//             // Configura botão de excluir conta no dropdown
//             const menuDeleteAccount = document.getElementById('menuDeleteAccount');
//             if (menuDeleteAccount) {
//                 menuDeleteAccount.addEventListener('click', (e) => {
//                     e.preventDefault();
//                     const deleteModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
//                     deleteModal.show();
//                 });
//             }
//         }

//     } catch (error) {
//         console.error("Erro ao inicializar menu do usuário:", error);
//     }
// }

// // exclui conta do usuário com cascata
// async function deleteUserAccount() {
//     const user = Auth.getLoggedInUser();
//     if (!user || !user.uid) {
//         throw new Error('Usuário não encontrado');
//     }

//     try {
//         console.log("Iniciando processo de exclusão de conta");

//         const userId = user.uid;
//         const userEmail = user.email;

//         console.log("Excluindo usuário do Firebase Authentication");
//         await Auth.deleteUserAccount();

//         console.log("Excluindo dados do Firestore");
//         await FirestoreService.deleteUserData(userId);

//         console.log("Limpando dados do localStorage");
//         cleanupLocalStorage(userEmail);

//         console.log("Exclusão de conta completa");
//         return true;
//     } catch (error) {
//         console.error("Erro completo na exclusão da conta:", error);
//         throw error;
//     }
// }

// // carregar dados do usuário para o formulário
// async function loadUserData() {
//     try {
//         const user = Auth.getLoggedInUser();
//         if (!user) {
//             window.location.href = 'login.html';
//             return;
//         }

//         // Referência ao documento do usuário no Firestore
//         const userRef = doc(db, "users", user.uid);
//         const userDoc = await getDoc(userRef);

//         if (userDoc.exists()) {
//             const userData = userDoc.data();

//             // Preencher o formulário com os dados do usuário
//             const nameInput = document.getElementById('name');
//             const emailInput = document.getElementById('email');

//             if (nameInput) nameInput.value = userData.name || user.name;
//             if (emailInput) emailInput.value = userData.email || user.email;
//         } else {
//             console.warn("Documento do usuário não encontrado no Firestore");
//         }
//     } catch (error) {
//         console.error("Erro ao carregar dados do usuário:", error);
//     }
// }

// // inicializar formulário de atualização de perfil
// async function initProfileForm() {
//     const profileForm = document.getElementById('profileForm');
//     if (!profileForm) return;

//     Swal = await loadSweetAlert();

//     profileForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         // Validar campos
//         const nameInput = document.getElementById('name');
//         const nameError = document.getElementById('nameError');

//         let isValid = true;

//         if (nameInput.value.trim() === '') {
//             nameError.textContent = 'Por favor, insira seu nome completo.';
//             isValid = false;
//         } else {
//             nameError.textContent = '';
//         }

//         if (isValid) {
//             try {
//                 const result = await Auth.updateUserName(nameInput.value.trim());

//                 if (result.success) {
//                     await Swal.fire({
//                         title: 'Perfil atualizado!',
//                         text: 'Seus dados foram atualizados com sucesso.',
//                         icon: 'success',
//                         confirmButtonText: 'OK',
//                         confirmButtonColor: '#2ecc71'
//                     });

//                     // Recarregar os dados do usuário no menu
//                     initUserMenu();
//                 } else {
//                     await Swal.fire({
//                         title: 'Erro',
//                         text: result.error || 'Ocorreu um erro ao atualizar seu perfil.',
//                         icon: 'error',
//                         confirmButtonText: 'OK',
//                         confirmButtonColor: '#e74c3c'
//                     });
//                 }
//             } catch (error) {
//                 console.error("Erro ao atualizar perfil:", error);
//                 Swal.fire({
//                     title: 'Erro',
//                     text: 'Ocorreu um erro ao atualizar seu perfil.',
//                     icon: 'error',
//                     confirmButtonText: 'OK',
//                     confirmButtonColor: '#e74c3c'
//                 });
//             }
//         }
//     });
// }

// // inicializar formulário de alteração de senha
// async function initPasswordForm() {
//     const passwordForm = document.getElementById('passwordForm');
//     if (!passwordForm) return;

//     Swal = await loadSweetAlert();

//     passwordForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         // Validar campos
//         const currentPasswordInput = document.getElementById('currentPassword');
//         const newPasswordInput = document.getElementById('newPassword');
//         const confirmPasswordInput = document.getElementById('confirmPassword');

//         const currentPasswordError = document.getElementById('currentPasswordError');
//         const newPasswordError = document.getElementById('newPasswordError');
//         const confirmPasswordError = document.getElementById('confirmPasswordError');

//         let isValid = true;

//         // Validação da senha atual
//         if (currentPasswordInput.value.trim() === '') {
//             currentPasswordError.textContent = 'Por favor, insira sua senha atual.';
//             isValid = false;
//         } else {
//             currentPasswordError.textContent = '';
//         }

//         // Validação da nova senha
//         if (newPasswordInput.value.length < 8) {
//             newPasswordError.textContent = 'A nova senha deve ter pelo menos 8 caracteres.';
//             isValid = false;
//         } else {
//             newPasswordError.textContent = '';
//         }

//         // Validação da confirmação de senha
//         if (confirmPasswordInput.value !== newPasswordInput.value) {
//             confirmPasswordError.textContent = 'As senhas não coincidem.';
//             isValid = false;
//         } else {
//             confirmPasswordError.textContent = '';
//         }

//         if (isValid) {
//             try {
//                 const result = await Auth.updateUserPassword(
//                     currentPasswordInput.value,
//                     newPasswordInput.value
//                 );

//                 if (result.success) {
//                     // Limpar campos
//                     passwordForm.reset();

//                     await Swal.fire({
//                         title: 'Senha atualizada!',
//                         text: 'Sua senha foi alterada com sucesso.',
//                         icon: 'success',
//                         confirmButtonText: 'OK',
//                         confirmButtonColor: '#2ecc71'
//                     });
//                 } else {
//                     await Swal.fire({
//                         title: 'Erro',
//                         text: result.error || 'Não foi possível atualizar sua senha.',
//                         icon: 'error',
//                         confirmButtonText: 'OK',
//                         confirmButtonColor: '#e74c3c'
//                     });
//                 }
//             } catch (error) {
//                 console.error("Erro ao atualizar senha:", error);
//                 Swal.fire({
//                     title: 'Erro',
//                     text: 'Ocorreu um erro ao atualizar sua senha.',
//                     icon: 'error',
//                     confirmButtonText: 'OK',
//                     confirmButtonColor: '#e74c3c'
//                 });
//             }
//         }
//     });
// }

// // inicializar função de excluir conta
// async function initDeleteAccount() {
//     const deleteAccountBtn = document.getElementById('deleteAccountBtn');
//     const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

//     if (!deleteAccountBtn || !confirmDeleteBtn) return;

//     Swal = await loadSweetAlert();

//     // Abrir modal ao clicar no botão de exclusão
//     deleteAccountBtn.addEventListener('click', () => {
//         const deleteModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
//         deleteModal.show();
//     });

//     // Confirmar exclusão da conta
//     confirmDeleteBtn.addEventListener('click', async () => {
//         const deleteConfirmPassword = document.getElementById('deleteConfirmPassword');
//         const deletePasswordError = document.getElementById('deletePasswordError');

//         if (!deleteConfirmPassword.value.trim()) {
//             deletePasswordError.textContent = 'Por favor, insira sua senha para confirmar.';
//             return;
//         } else {
//             deletePasswordError.textContent = '';
//         }

//         try {
//             // Reautenticar usuário
//             const reauth = await Auth.reauthenticate(deleteConfirmPassword.value);

//             if (!reauth.success) {
//                 deletePasswordError.textContent = reauth.error || 'Senha incorreta';
//                 return;
//             }

//             // Mostrar mensagem de carregamento
//             Swal.fire({
//                 title: 'Excluindo conta...',
//                 html: 'Por favor, aguarde enquanto excluímos seus dados.',
//                 allowOutsideClick: false,
//                 didOpen: () => {
//                     Swal.showLoading();
//                 }
//             });

//             // Excluir dados do usuário e a conta
//             await Auth.deleteUserAccount();

//             // Mostrar mensagem de sucesso e redirecionar
//             await Swal.fire({
//                 title: 'Conta excluída',
//                 text: 'Sua conta foi excluída com sucesso.',
//                 icon: 'success',
//                 confirmButtonText: 'OK',
//                 allowOutsideClick: false
//             });

//             // Redireciona para login sem usar o método logout
//             // porque a conta já foi excluída
//             window.location.href = 'login.html';

//         } catch (error) {
//             console.error("Erro ao excluir conta:", error);

//             // Fechar modal
//             try {
//                 const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
//                 if (deleteModal) deleteModal.hide();
//             } catch (modalError) {
//                 console.warn("Não foi possível fechar o modal:", modalError);
//             }

//             const errorMessage = error.code === 'auth/requires-recent-login'
//                 ? 'Por razões de segurança, você precisa fazer login novamente antes de excluir sua conta.'
//                 : 'Ocorreu um erro ao excluir sua conta. Por favor, tente novamente.';

//             // Mostrar mensagem de erro
//             await Swal.fire({
//                 title: 'Erro',
//                 text: errorMessage,
//                 icon: 'error',
//                 confirmButtonText: 'OK',
//                 confirmButtonColor: '#e74c3c'
//             });

//             if (error.code === 'auth/requires-recent-login') {
//                 // Fazer logout se for necessário reautenticar
//                 window.location.href = 'login.html';
//             }
//         }
//     });
// }

// // inicialização com tratamento de erros
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         // Verificar autenticação
//         if (!Auth.isAuthenticated()) {
//             window.location.href = 'login.html';
//             return;
//         }

//         // Inicializar componentes
//         await initUserMenu();
//         await loadUserData();
//         await initProfileForm();
//         await initPasswordForm();
//         await initDeleteAccount();

//     } catch (error) {
//         console.error("Erro na inicialização da página de perfil:", error);
//     }
// });