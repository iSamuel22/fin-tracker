export class Gasto {
  #descricao;
  #valor;
  #data;
  #categoria;

  constructor(descricao, valor, data, categoria) {
    this.#descricao = descricao;
    this.setValor(valor);
    this.#data = data;
    this.#categoria = categoria;
  }

  get descricao() {
    return this.#descricao;
  }

  set descricao(value) {
    if (!value || value.trim() === '') {
      throw new Error('Descrição não pode estar vazia');
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

  get data() {
    return this.#data;
  }

  set data(value) {
    if (!value) {
      throw new Error('Data não pode estar vazia');
    }
    this.#data = value;
  }

  get categoria() {
    return this.#categoria;
  }

  set categoria(value) {
    if (!value || value.trim() === '') {
      throw new Error('Categoria não pode estar vazia');
    }
    this.#categoria = value.trim();
  }

  toJSON() {
    return {
      descricao: this.#descricao,
      valor: this.#valor,
      data: this.#data,
      categoria: this.#categoria
    };
  }
}