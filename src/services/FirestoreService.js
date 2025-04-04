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
    // inicializa coleções: método silencioso para evitar erros no console
    static async inicializarColecoes() {
        try {
            const user = Auth.getLoggedInUser();
            if (!user) return false;
            
            // lista de coleções para garantir que existam
            const collections = ["gastos", "receitas", "metas", "configuracoes"];
            
            for (const collectionName of collections) {
                try {
                    const collectionRef = collection(db, collectionName);
                    // verifica se a coleção existe fazendo uma consulta pequena
                    const q = query(collectionRef, where("userId", "==", user.uid), where("_dummy", "==", true));
                    await getDocs(q);
                } catch (err) {
                    console.warn(`Aviso: Verificação da coleção ${collectionName} falhou, mas continuando...`);
                }
            }
            
            return true;
        } catch (error) {
            console.warn("Aviso: Erro ao inicializar coleções:", error);
            return false;
        }
    }

    // métodos para gastos com tratamento de erros
    static async getGastos() {
        try {
            const user = Auth.getLoggedInUser();
            if (!user) return [];
    
            const gastosRef = collection(db, "gastos");
            const q = query(gastosRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.warn("Aviso: Erro ao obter gastos:", error);
            return [];
        }
    }

    static async addGasto(gasto) {
        try {
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
        } catch (error) {
            console.warn("Aviso: Erro ao adicionar gasto:", error);
            return null;
        }
    }

    static async updateGasto(id, gasto) {
        try {
            const gastoRef = doc(db, "gastos", id);
            await updateDoc(gastoRef, gasto);
            return { id, ...gasto };
        } catch (error) {
            console.warn("Aviso: Erro ao atualizar gasto:", error);
            return null;
        }
    }

    static async deleteGasto(id) {
        try {
            const gastoRef = doc(db, "gastos", id);
            await deleteDoc(gastoRef);
            return true;
        } catch (error) {
            console.warn("Aviso: Erro ao excluir gasto:", error);
            return false;
        }
    }

    // métodos para receitas com tratamento de erros
    static async getReceitas() {
        try {
            const user = Auth.getLoggedInUser();
            if (!user) return [];
    
            const receitasRef = collection(db, "receitas");
            const q = query(receitasRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.warn("Aviso: Erro ao obter receitas:", error);
            return [];
        }
    }

    static async addReceita(receita) {
        try {
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
        } catch (error) {
            console.warn("Aviso: Erro ao adicionar receita:", error);
            return null;
        }
    }

    static async updateReceita(id, receita) {
        try {
            const receitaRef = doc(db, "receitas", id);
            await updateDoc(receitaRef, receita);
            return { id, ...receita };
        } catch (error) {
            console.warn("Aviso: Erro ao atualizar receita:", error);
            return null;
        }
    }

    static async deleteReceita(id) {
        try {
            const receitaRef = doc(db, "receitas", id);
            await deleteDoc(receitaRef);
            return true;
        } catch (error) {
            console.warn("Aviso: Erro ao excluir receita:", error);
            return false;
        }
    }

    // métodos para metas com tratamento de erros
    static async getMetas() {
        try {
            const user = Auth.getLoggedInUser();
            if (!user) return [];
    
            const metasRef = collection(db, "metas");
            const q = query(metasRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.warn("Aviso: Erro ao obter metas:", error);
            return [];
        }
    }

    static async addMeta(meta) {
        try {
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
        } catch (error) {
            console.warn("Aviso: Erro ao adicionar meta:", error);
            return null;
        }
    }

    static async updateMeta(id, meta) {
        try {
            const metaRef = doc(db, "metas", id);
            await updateDoc(metaRef, meta);
            return { id, ...meta };
        } catch (error) {
            console.warn("Aviso: Erro ao atualizar meta:", error);
            return null;
        }
    }

    static async deleteMeta(id) {
        try {
            const metaRef = doc(db, "metas", id);
            await deleteDoc(metaRef);
            return true;
        } catch (error) {
            console.warn("Aviso: Erro ao excluir meta:", error);
            return false;
        }
    }

    // métodos para exclusão de dados de usuário com tratamento de erros
    static async deleteUserDocument(userId) {
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                await deleteDoc(userRef);
                return true;
            }
            return false;
        } catch (error) {
            console.warn("Aviso: Erro ao excluir documento do usuário:", error);
            return false;
        }
    }

    static async deleteUserData(userId) {
        try {
            const batch = writeBatch(db);
            let totalDeleted = 0;
            
            const collections = [
                "gastos", 
                "receitas", 
                "metas", 
                "configuracoes", 
                "relatorios", 
                "categorias", 
                "notificacoes"
            ];
            
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
                    console.log(`Coleção ${collectionName} não encontrada ou vazia`);
                }
            }
            
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
            console.warn("Aviso: Erro ao excluir dados do usuário:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async deleteUserAccount() {
        try {
            const user = Auth.getLoggedInUser();
            if (!user || !user.uid) {
                throw new Error("Usuário não encontrado ou não autenticado");
            }
            
            const result = await this.deleteUserData(user.uid);
            
            if (result.success) {
                Auth.logout();
                return true;
            }
            return false;
        } catch (error) {
            console.warn("Aviso: Falha ao excluir conta:", error);
            return false;
        }
    }
}

export { FirestoreService };