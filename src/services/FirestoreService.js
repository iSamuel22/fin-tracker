import { 
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../config/firebase.js";
import { Auth } from "./Auth.js";

class FirestoreService {
    // métodos para gastos
    static async getGastos() {
        const user = Auth.getLoggedInUser();
        if (!user) return [];

        // gastos db
        const gastosRef = collection(db, "gastos");
        const q = query(gastosRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async addGasto(gasto) {
        const user = Auth.getLoggedInUser();
        if (!user) return null;

        const gastosRef = collection(db, "gastos");
        const gastoData = {
            ...gasto,
            userId: user.uid,
            createdAt: new Date()
        };

        const docRef = await addDoc(gastosRef, gastoData);
        return { id: docRef.id, ...gastoData };
    }

    static async updateGasto(id, gasto) {
        const gastoRef = doc(db, "gastos", id);
        await updateDoc(gastoRef, gasto);
        return { id, ...gasto };
    }

    static async deleteGasto(id) {
        const gastoRef = doc(db, "gastos", id);
        await deleteDoc(gastoRef);
    }

    // métodos para receitas
    static async getReceitas() {
        const user = Auth.getLoggedInUser();
        if (!user) return [];

        const receitasRef = collection(db, "receitas");
        const q = query(receitasRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async addReceita(receita) {
        const user = Auth.getLoggedInUser();
        if (!user) return null;

        const receitasRef = collection(db, "receitas");
        const receitaData = {
            ...receita,
            userId: user.uid,
            createdAt: new Date()
        };

        const docRef = await addDoc(receitasRef, receitaData);
        return { id: docRef.id, ...receitaData };
    }

    static async updateReceita(id, receita) {
        const receitaRef = doc(db, "receitas", id);
        await updateDoc(receitaRef, receita);
        return { id, ...receita };
    }

    static async deleteReceita(id) {
        const receitaRef = doc(db, "receitas", id);
        await deleteDoc(receitaRef);
    }

    // métodos para metas
    static async getMetas() {
        const user = Auth.getLoggedInUser();
        if (!user) return [];

        const metasRef = collection(db, "metas");
        const q = query(metasRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async addMeta(meta) {
        const user = Auth.getLoggedInUser();
        if (!user) return null;

        const metasRef = collection(db, "metas");
        const metaData = {
            ...meta,
            userId: user.uid,
            createdAt: new Date()
        };

        const docRef = await addDoc(metasRef, metaData);
        return { id: docRef.id, ...metaData };
    }

    static async updateMeta(id, meta) {
        const metaRef = doc(db, "metas", id);
        await updateDoc(metaRef, meta);
        return { id, ...meta };
    }

    static async deleteMeta(id) {
        const metaRef = doc(db, "metas", id);
        await deleteDoc(metaRef);
    }

    // métodos para configurações de usuário no Firestore
    static async deleteUserDocument(userId) {
        try {
            const userRef = doc(db, "users", userId);
            // checa se o documento existe antes de tentar excluí-lo
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                await deleteDoc(userRef);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erro ao excluir documento do usuário:", error);
            throw error;
        }
    }

    static async deleteUserData(userId) {
        try {
            // com batch, podemos excluir vários documentos em uma única operação
            const batch = writeBatch(db);
            let totalDeleted = 0;
            
            // lista de coleções a serem processadas
            const collections = [
                "gastos", 
                "receitas", 
                "metas", 
                "configuracoes", 
                "relatorios", 
                "categorias", 
                "notificacoes"
            ];
            
            // itera sobre cada coleção e excluir documentos
            for (const collectionName of collections) {
                try {
                    const collectionRef = collection(db, collectionName);
                    const q = query(collectionRef, where("userId", "==", userId));
                    const snapshot = await getDocs(q);
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            batch.delete(doc.ref);
                            totalDeleted++;
                        });
                        console.log(`Encontrados ${snapshot.size} documentos em ${collectionName} para exclusão`);
                    }
                } catch (err) {
                    // se a coleção não existir ou estiver vazia, apenas ignore
                    console.log(`Coleção ${collectionName} não encontrada ou vazia`);
                }
            }
            
            // executa o batch de exclusão se houver documentos a serem excluídos
            if (totalDeleted > 0) {
                await batch.commit();
                console.log(`${totalDeleted} documentos excluídos em cascata`);
            }
    
            const userDeleted = await this.deleteUserDocument(userId);
            
            return {
                success: true,
                documentsDeleted: totalDeleted,
                userDeleted: userDeleted
            };
        } catch (error) {
            console.error("Erro ao excluir dados do usuário:", error);
            throw error;
        }
    }

    // método para excluir conta do usuário
    static async deleteUserAccount() {
        const user = Auth.getLoggedInUser();
        if (!user || !user.uid) {
            throw new Error("Usuário não encontrado ou não autenticado");
        }
        
        try {
            // exclui os dados do usuário
            const result = await this.deleteUserData(user.uid);
            
            // se a exclusão dos dados for bem-sucedida, exclui o usuário
            if (result.success) {
                Auth.logout();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Falha ao excluir conta:", error);
            throw error;
        }
    }
}

export { FirestoreService };