export class Cliente {
    #nome;
    #email;
    #senha;

    constructor(nome, email, senha) {
        this.#nome = nome;
        this.#email = email;
        this.#senha = senha;
    }

    get nome() {
        return this.#nome;
    }

    set nome(nome) {
        this.#nome = nome;
    }

    get email() {
        return this.#email;
    }

    set email(email) {
        this.#email = email;
    }

    get senha() {
        return this.#senha;
    }

    set senha(senha) {
        this.#senha = senha;
    }

    calcularSaldo(receitas, gastos) {
        // se não receber arrays válidos, retorna 0
        if (!Array.isArray(receitas) || !Array.isArray(gastos)) {
            return 0;
        }
        
        // soma todas as receitas
        const totalReceitas = receitas.reduce((total, receita) => {
            return total + parseFloat(receita.valor || 0);
        }, 0);
        
        // soma todos os gastos
        const totalGastos = gastos.reduce((total, gasto) => {
            return total + parseFloat(gasto.valor || 0);
        }, 0);
        
        // retorna a diferença (saldo)
        return totalReceitas - totalGastos;
    }
}