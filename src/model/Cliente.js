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

    calcularSaldo() {
        return 0.0;
    }
}