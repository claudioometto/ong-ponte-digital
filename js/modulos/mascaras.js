/*
  Instituto Ponte Digital - máscaras de entrada do formulário de cadastro
  ----------------------------------------------------------------------
  Responsabilidade deste arquivo: APENAS formatar o que a pessoa digita
  (CPF, telefone e CEP). Quem valida e bloqueia o envio é o navegador,
  a partir dos atributos required / pattern / minlength / min / max
  declarados no HTML, com as regras extras e as mensagens de erro de
  validacao.js. Sem este script o formulário continua validando — a pessoa
  só precisaria digitar a pontuação manualmente.
*/

/* Remove tudo que não for dígito */
function apenasDigitos(valor) {
  return valor.replace(/\D/g, '');
}

/* 00000000000 -> 000.000.000-00 (formatação progressiva) */
function mascaraCPF(valor) {
  var d = apenasDigitos(valor).slice(0, 11);
  if (d.length > 9) {
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  }
  if (d.length > 6) {
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
  }
  if (d.length > 3) {
    return d.slice(0, 3) + '.' + d.slice(3);
  }
  return d;
}

/* 11 dígitos -> (00) 00000-0000 | 10 dígitos -> (00) 0000-0000 */
function mascaraTelefone(valor) {
  var d = apenasDigitos(valor).slice(0, 11);
  if (d.length > 10) {
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  if (d.length > 6) {
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  }
  if (d.length > 2) {
    return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  }
  if (d.length > 0) {
    return '(' + d;
  }
  return d;
}

/* 00000000 -> 00000-000 */
function mascaraCEP(valor) {
  var d = apenasDigitos(valor).slice(0, 8);
  if (d.length > 5) {
    return d.slice(0, 5) + '-' + d.slice(5);
  }
  return d;
}

/* Liga a função de máscara ao evento input do campo correspondente */
function aplicar(raiz, id, formatar) {
  var campo = raiz.querySelector('#' + id);
  if (!campo) {
    return;
  }
  campo.addEventListener('input', function () {
    campo.value = formatar(campo.value);
  });
}

/*
  Ponto de entrada: o roteador chama a cada troca de tela, passando o
  main#app. Em telas sem formulário, nenhum campo é encontrado e nada acontece.
*/
export function aplicarMascaras(raiz) {
  aplicar(raiz, 'cpf', mascaraCPF);
  aplicar(raiz, 'telefone', mascaraTelefone);
  aplicar(raiz, 'cep', mascaraCEP);
}
