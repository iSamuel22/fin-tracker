import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword as firebaseUpdatePassword
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

            // Verificar se o FirestoreService tem o método removeAllListeners antes de chamá-lo
            if (FirestoreService && typeof FirestoreService.removeAllListeners === 'function') {
                FirestoreService.removeAllListeners();
            }

            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    // Método para verificar senha do usuário
    static async verifyPassword(email, password) {
        try {
            // Tenta fazer login com as credenciais fornecidas
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error("Erro na verificação de senha:", error);
            return false;
        }
    }

    // método atualizado para deletar a conta do usuário
    static async deleteUserAccount(password) {
        try {
            // Verifica se o usuário está autenticado
            const currentUser = auth.currentUser;

            if (!currentUser) {
                console.error("No authenticated user found");
                return false;
            }

            // Reautenticar o usuário antes de excluir a conta
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                password
            );

            // Reautenticar
            await reauthenticateWithCredential(currentUser, credential);

            console.log("Deleting user from Firebase Authentication:", currentUser.uid);

            // Exclui o usuário do Firebase Authentication
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
            } else if (error.code === 'auth/wrong-password') {
                throw new Error('A senha informada está incorreta');
            }

            throw error;
        }
    }

    static async updateUserProfile(userData) {
        try {
            // Verifica se o usuário está autenticado
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("No authenticated user found");
                return false;
            }

            // Atualiza o documento do usuário no Firestore
            await setDoc(doc(db, "users", currentUser.uid), userData, { merge: true });

            // Atualiza os dados no localStorage
            const storedUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};
            const updatedUser = {
                ...storedUser,
                ...userData
            };
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

            return true;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    static async updatePassword(currentPassword, newPassword) {
        try {
            // Obter o usuário atual
            const user = auth.currentUser;

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // Verificar credenciais atuais para reautenticar o usuário
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            // Reautenticar o usuário
            await reauthenticateWithCredential(user, credential);

            // Atualizar a senha usando a função importada do Firebase
            await firebaseUpdatePassword(user, newPassword);

            console.log('Senha atualizada com sucesso');
            return true;
        } catch (error) {
            // Não registrar erros conhecidos no console
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-login-credentials') {
                // Silenciosamente lançar um erro com mensagem traduzida
                throw new Error('Senha atual incorreta');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('A nova senha é muito fraca');
            } else if (error.code === 'auth/requires-recent-login') {
                throw new Error('Esta operação requer autenticação recente. Por favor, faça login novamente.');
            } else {
                // Apenas registrar no console erros não conhecidos
                console.error('Erro ao atualizar senha:', error);
                throw new Error('Erro ao atualizar senha: ' + error.message);
            }
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