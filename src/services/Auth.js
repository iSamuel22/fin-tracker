import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { auth, db } from "../config/firebase.js";
import { FirestoreService } from "./FirestoreService.js";

class Auth {
    static async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                localStorage.setItem('loggedInUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: userDoc.data().name
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }

    static async register(name, email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // cria a coleção de usuários
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date()
            });

            localStorage.setItem('loggedInUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: name
            }));
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            return false;
        }
    }

    static async logout() {
        try {
            await signOut(auth);
            FirestoreService.removeAllListeners();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    // método para deletar a conta do usuário
    static async deleteUserAccount() {
        try {
            // verifica se o usuário está autenticado
            const currentUser = auth.currentUser;

            if (!currentUser) {
                console.error("No authenticated user found");
                return false;
            }

            console.log("Deleting user from Firebase Authentication:", currentUser.uid);

            // deleta o usuário do Firebase Authentication
            await deleteUser(currentUser);

            return true;
        } catch (error) {
            console.error("Error deleting account:", error);

            if (error.code === 'auth/requires-recent-login') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Atenção',
                    text: 'Por razões de segurança, você precisa fazer login novamente antes de excluir sua conta.',
                    confirmButtonText: 'OK'
                });
                this.logout();
            }

            throw error;
        }
    }

    static getLoggedInUser() {
        return JSON.parse(localStorage.getItem('loggedInUser'));
    }

    static isAuthenticated() {
        return !!localStorage.getItem('loggedInUser');
    }

    static onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }
}

export { Auth };