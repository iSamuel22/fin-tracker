export class Meta {
    #nome;
    #descricao;
    #valor;
    #dataCriacao;

    constructor(nome, descricao, valor, dataCriacao = null) {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome não pode estar vazio');
        }
        this.#nome = nome.trim();

        if (!descricao || descricao.trim() === '') {
            throw new Error('Descrição não pode estar vazia');
        }
        this.#descricao = descricao.trim();

        this.setValor(valor);
        this.#dataCriacao = dataCriacao ? new Date(dataCriacao) : new Date();
    }

    get nome() {
        return this.#nome;
    }

    set nome(value) {
        if (!value || value.trim() === '') {
            throw new Error('Nome não pode estar vazio');
        }
        this.#nome = value.trim();
    }

    get descricao() {
        return this.#descricao;
    }

    set descricao(value) {
        if (!value || value.trim() === '') {
            throw new Error('Descrição não pode estar vazia');
        }
        if (value.length > 30) {
            throw new Error('Descrição não pode ter mais de 30 caracteres');
        }
        this.#descricao = value.trim();
    }

    get valor() {
        return this.#valor;
    }

    setValor(value) {
        const valorNumerico = parseFloat(value);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            throw new Error('Valor deve ser um número positivo');
        }
        this.#valor = valorNumerico;
    }

    set valor(value) {
        this.setValor(value);
    }

    get dataCriacao() {
        return this.#dataCriacao;
    }

    toJSON() {
        // verifica se a data é válida antes de converter
        let dataCriacaoString;
        try {
            dataCriacaoString = this.#dataCriacao instanceof Date && !isNaN(this.#dataCriacao.getTime()) 
                ? this.#dataCriacao.toISOString() 
                : new Date().toISOString();
        } catch (e) {
            dataCriacaoString = new Date().toISOString();
        }
        
        return {
            nome: this.#nome,
            descricao: this.#descricao,
            valor: this.#valor,
            dataCriacao: dataCriacaoString
        };
    }
}
