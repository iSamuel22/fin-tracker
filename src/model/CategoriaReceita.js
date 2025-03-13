export class CategoriaReceita {
  #nome;
  #descricao;

  constructor(nome, descricao) {
    this.#nome = nome;
    this.#descricao = descricao;
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#nome = value;
  }

  get descricao() {
    return this.#descricao;
  }

  set descricao(value) {
    this.#descricao = value;
  }
  
}