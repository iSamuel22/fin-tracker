import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from "../config/firebase.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
import { FirestoreService } from "../services/FirestoreService.js";

// inicializa firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase inicializado:", app.name);
console.log("Firebase config:", firebaseConfig);

// *** área de login ***
function iniciarLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginError = document.getElementById('loginError');

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
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    localStorage.setItem('loggedInUser', JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: userDoc.data().name
                    }));

                    // Inicializar coleções
                    try {
                        await FirestoreService.inicializarColecoes();
                        console.log("Coleções inicializadas após login");
                    } catch (error) {
                        console.error("Erro ao inicializar coleções:", error);
                    }

                    window.location.href = "dashboard.html";
                } else {
                    loginError.textContent = 'Email ou senha incorretos.';
                    loginError.style.display = 'block';
                }
            } catch (error) {
                console.error(error);
                loginError.textContent = 'Erro ao fazer login.';
                loginError.style.display = 'block';
            }
        }
    });
}

// *** área de registro ***
function iniciarRegistro() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    const nameInput = document.getElementById('name');
    const emailInputRegister = document.getElementById('emailRegister');
    const passwordInputRegister = document.getElementById('passwordRegister');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const nameError = document.getElementById('nameError');
    const emailErrorRegister = document.getElementById('emailErrorRegister');
    const passwordErrorRegister = document.getElementById('passwordErrorRegister');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const registerError = document.getElementById('registerError');

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

                // verifica se a coleção users existe e criá-la se necessário
                const userData = {
                    name: nameInput.value,
                    email: emailInputRegister.value,
                    createdAt: new Date()
                };

                console.log("Tentando criar documento do usuário:", userData);

                // usa setDoc com doc específico para garantir a criação
                try {
                    // certificando de que a coleção existe primeiro
                    const usersCollectionRef = collection(db, "users");
                    console.log("Referência da coleção users:", usersCollectionRef);

                    // aqui cria o documento do usuário
                    const userDocRef = doc(db, "users", user.uid);
                    console.log("Referência do documento do usuário:", userDocRef);

                    await setDoc(userDocRef, userData);
                    console.log("Documento do usuário criado com sucesso!");
                } catch (firestoreError) {
                    console.error("Erro ao criar documento no Firestore:", firestoreError);
                    throw firestoreError;
                }

                localStorage.setItem('loggedInUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: nameInput.value
                }));

                console.log("Usuário registrado com sucesso, redirecionando...");
                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Erro completo no registro:", error);

                if (error.code === 'auth/email-already-in-use') {
                    // substitui por SweetAlert
                    Swal.fire({
                        title: 'Email já cadastrado',
                        html: `
                            <p>Este email já está cadastrado.</p>
                        `,
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                } else {
                    // outros erros com SweetAlert
                    Swal.fire({
                        title: 'Erro ao registrar',
                        text: error.message || error,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        }
    });
}

// *** validação de email ***
function validandoEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada, inicializando funções de login e registro");
    iniciarLogin();
    iniciarRegistro();
});