/*
  Instituto Ponte Digital - motor de templates
  --------------------------------------------
  Responsabilidade deste arquivo: transformar uma lista de dados em
  elementos na tela, a partir de um elemento template do index.html.

  A marcação mora no HTML; o JavaScript só clona e preenche. Todo texto
  entra por textContent, que nunca interpreta HTML: um valor como
  "<b>oi</b>" aparece escrito na tela, em vez de virar uma tag.
*/

/* Encontra, dentro da cópia, o elemento marcado com data-campo="nome" */
export function campo(raiz, nome) {
  return raiz.querySelector('[data-campo="' + nome + '"]');
}

/*
  Para cada item: clona o conteúdo do template, entrega a cópia à função
  preencher e guarda o resultado num DocumentFragment. O fragmento é
  inserido no destino de uma vez só: a página é recalculada uma vez,
  e não uma vez por item.
*/
export function renderizarLista(destino, idTemplate, itens, preencher) {
  const modelo = document.getElementById(idTemplate);
  if (!destino || !modelo) return;

  const lote = document.createDocumentFragment();
  itens.forEach((item) => {
    const copia = modelo.content.cloneNode(true);
    preencher(copia, item);
    lote.append(copia);
  });
  destino.append(lote);
}
