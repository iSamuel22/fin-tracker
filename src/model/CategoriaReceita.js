export class CategoriaReceita {
  #nome;

  constructor(nome) {
    this.#nome = nome;
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#nome = value;
  }
  
}