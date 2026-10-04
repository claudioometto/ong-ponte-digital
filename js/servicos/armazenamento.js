/*
  Instituto Ponte Digital - acesso ao localStorage
  ------------------------------------------------
  Responsabilidade deste arquivo: ser o único ponto do código que toca o
  localStorage. Quem chama trabalha com objetos e arrays; a conversão para
  texto (JSON.stringify) e de volta (JSON.parse) acontece só aqui.

  O localStorage pode falhar: aba anônima com armazenamento bloqueado,
  cota cheia, ou um texto corrompido que o JSON.parse não entende. Nenhuma
  dessas falhas pode derrubar o site: ler() devolve o valor padrão e
  gravar() devolve false. O site continua funcionando, só sem lembrar.

  Todas as chaves levam o prefixo "ponte-digital:", para não colidir com
  dados de outros sites servidos pelo mesmo domínio (ex.: localhost).
*/

const PREFIXO = 'ponte-digital:';

export function ler(chave, padrao) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave);
    return texto === null ? padrao : JSON.parse(texto);
  } catch (erro) {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch (erro) {
    /* sem armazenamento, não há o que remover */
  }
}
