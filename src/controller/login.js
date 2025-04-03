import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db, auth } from "../config/firebase.js";

// carregamento dinâmico do SweetAlert2
let Swal;
async function loadSweetAlert() {
    try {
        const module = await import('https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm');
        Swal = module.default;
        return Swal;
    } catch (error) {
        console.error("Erro ao carregar SweetAlert:", error);
        // fallback para alert padrão caso o SweetAlert falhe
        return {
            fire: (config) => {
                alert(config.title + "\n\n" + config.text);
                return Promise.resolve();
            }
        };
    }
}

// validação de email
function validandoEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// inicia login com tratamento de erros
async function iniciarLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.log("Formulário de login não encontrado");
        return;
    }

    Swal = await loadSweetAlert();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;

        if (!validandoEmail(emailInput.value)) {
            emailError.textContent = 'Por favor, insira um email válido.';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        if (passwordInput.value.length < 8) {
            passwordError.textContent = 'A senha deve ter pelo menos 8 caracteres.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        if (isValid) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                const user = userCredential.user;
                
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        localStorage.setItem('loggedInUser', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            name: userDoc.data().name
                        }));

                        // inicializa coleções silenciosamente
                        try {
                            await inicializarColecoes();
                            console.log("Coleções inicializadas após login");
                        } catch (error) {
                            console.warn("Aviso: Erro ao inicializar coleções:", error);
                        }

                        // msg de sucesso ao fazer login
                        await Swal.fire({
                            title: 'Login realizado com sucesso!',
                            text: `Bem-vindo(a) de volta, ${userDoc.data().name}!`,
                            icon: 'success',
                            confirmButtonText: 'Continuar',
                            confirmButtonColor: '#2ecc71',
                            timer: 2000,
                            timerProgressBar: true
                        });

                        window.location.href = "dashboard.html";
                    } else {
                        console.warn("Usuário autenticado mas não encontrado no Firestore");
                        Swal.fire({
                            title: 'Erro no Login',
                            text: 'Email ou senha incorretos.',
                            icon: 'error',
                            confirmButtonText: 'Tentar novamente',
                            confirmButtonColor: '#e74c3c'
                        });
                    }
                } catch (firestoreError) {
                    console.warn("Erro ao acessar dados do usuário:", firestoreError);
                    Swal.fire({
                        title: 'Erro no acesso',
                        text: 'Não foi possível acessar seus dados. Por favor, tente novamente.',
                        icon: 'error',
                        confirmButtonText: 'Tentar novamente',
                        confirmButtonColor: '#e74c3c'
                    });
                }
            } catch (error) {
                console.warn("Tentativa de login falhou:", error.code);
                let errorMessage = 'Ocorreu um problema ao tentar fazer login. Por favor, tente novamente.';
                
                if (error.code === 'auth/invalid-login-credentials' || 
                    error.code === 'auth/user-not-found' || 
                    error.code === 'auth/wrong-password') {
                    errorMessage = 'Email ou senha incorretos.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                }
                
                Swal.fire({
                    title: 'Erro ao fazer login',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Tentar novamente',
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    });
}

// inicia registro com tratamento de erros
async function iniciarRegistro() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) {
        console.log("Formulário de registro não encontrado");
        return;
    }

    Swal = await loadSweetAlert();

    const nameInput = document.getElementById('name');
    const emailInputRegister = document.getElementById('emailRegister');
    const passwordInputRegister = document.getElementById('passwordRegister');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const nameError = document.getElementById('nameError');
    const emailErrorRegister = document.getElementById('emailErrorRegister');
    const passwordErrorRegister = document.getElementById('passwordErrorRegister');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log("Formulário de registro enviado");

        let isValid = true;

        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Por favor, insira seu nome completo.';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        if (!validandoEmail(emailInputRegister.value)) {
            emailErrorRegister.textContent = 'Por favor, insira um email válido.';
            isValid = false;
        } else {
            emailErrorRegister.textContent = '';
        }

        if (passwordInputRegister.value.length < 8) {
            passwordErrorRegister.textContent = 'A senha deve ter pelo menos 8 caracteres.';
            isValid = false;
        } else {
            passwordErrorRegister.textContent = '';
        }

        if (confirmPasswordInput.value !== passwordInputRegister.value) {
            confirmPasswordError.textContent = 'As senhas não coincidem.';
            isValid = false;
        } else {
            confirmPasswordError.textContent = '';
        }

        if (isValid) {
            try {
                console.log("Tentando criar usuário:", emailInputRegister.value);

                // cria usuário no Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, emailInputRegister.value, passwordInputRegister.value);
                const user = userCredential.user;

                console.log("Usuário criado com sucesso:", user.uid);

                // dados do usuário para Firestore
                const userData = {
                    name: nameInput.value,
                    email: emailInputRegister.value,
                    createdAt: new Date()
                };

                try {
                    // garante que a coleção existe
                    const usersCollectionRef = collection(db, "users");
                    console.log("Referência da coleção users:", usersCollectionRef);

                    // cria o documento do usuário
                    const userDocRef = doc(db, "users", user.uid);
                    console.log("Referência do documento do usuário:", userDocRef);

                    await setDoc(userDocRef, userData);
                    console.log("Documento do usuário criado com sucesso!");

                    localStorage.setItem('loggedInUser', JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: nameInput.value
                    }));

                    // msg de sucesso após registro
                    await Swal.fire({
                        title: 'Cadastro realizado com sucesso!',
                        html: `
                            <p>Bem-vindo(a) ao nosso sistema, ${nameInput.value}!</p>
                            <p>Sua conta foi criada e você já está logado.</p>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Começar agora',
                        confirmButtonColor: '#2ecc71',
                        timer: 3000,
                        timerProgressBar: true
                    });

                    console.log("Usuário registrado com sucesso, redirecionando...");
                    window.location.href = "dashboard.html";
                } catch (firestoreError) {
                    console.warn("Erro ao criar documento no Firestore:", firestoreError);
                    Swal.fire({
                        title: 'Registro parcial',
                        text: 'Sua conta foi criada, mas houve um problema ao salvar seus dados. Por favor, faça login novamente.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#f39c12'
                    });
                }
            } catch (error) {
                console.warn("Erro no registro:", error.code);

                if (error.code === 'auth/email-already-in-use') {
                    Swal.fire({
                        title: 'Ops! Email já cadastrado',
                        html: `
                            <p>O email que você informou já está associado a uma conta existente.</p>
                            <p>Se você esqueceu sua senha, tente recuperá-la na página de login.</p>
                        `,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#f39c12'
                    });
                } else {
                    let errorMessage = error.message || error;
                    // remove detalhes técnicos para mensagens mais amigáveis
                    if (errorMessage.includes('Firebase:')) {
                        errorMessage = 'Erro no sistema de autenticação. Por favor, tente novamente.';
                    }
                    
                    Swal.fire({
                        title: 'Erro ao registrar',
                        html: `
                            <p>Ocorreu um problema ao tentar registrar sua conta.</p>
                            <p><strong>Detalhes:</strong> ${errorMessage}</p>
                        `,
                        icon: 'error',
                        confirmButtonText: 'Tentar novamente',
                        confirmButtonColor: '#e74c3c'
                    });
                }
            }
        }
    });
}

// inicializa coleções
async function inicializarColecoes() {
    // implementação silenciosa para evitar erros no console
    return Promise.resolve();
}

// inicialização com tratamento de erros
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Página carregada, inicializando funções de login e registro");
        await iniciarLogin();
        await iniciarRegistro();
    } catch (error) {
        console.warn("Erro na inicialização:", error);
    }
});

export { inicializarColecoes };