/*
  Instituto Ponte Digital - verificação de consistência do cadastro
  -----------------------------------------------------------------
  Responsabilidade deste arquivo: decidir se cada campo está correto e
  avisar a pessoa, com uma mensagem escrita logo abaixo do campo.

  Uma fonte só de verdade: as regras do HTML (required, pattern, min...)
  e as regras deste arquivo (dígito do CPF, idade, campos condicionais)
  passam todas pela API de validação do navegador. As regras daqui entram
  por setCustomValidity; quem pergunta "o campo é válido?" usa sempre
  campo.validity, e o resumo de erros do feedback.js continua funcionando.

  Quando o aviso aparece:
    - ao sair do campo pela primeira vez (focusout);
    - depois disso, a cada alteração (input/change), para sumir assim que
      o erro for corrigido;
    - em todos os campos de uma vez, na tentativa de envio.

  Estado visual: aria-invalid="true" (erro) ou "false" (obrigatório correto).
  O CSS lê esse atributo; o leitor de tela também.
*/

/* ---------- Datas de referência, sempre a partir de hoje ---------- */

/* Data local no formato dos campos date (aaaa-mm-dd) */
function dataISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return data.getFullYear() + '-' + mes + '-' + dia;
}

function hojeISO() {
  return dataISO(new Date());
}

/* Quem nasceu até esta data já tem 18 anos completos hoje */
function limiteMaioridadeISO() {
  const data = new Date();
  data.setFullYear(data.getFullYear() - 18);
  return dataISO(data);
}

/* ---------- Regras de consistência ---------- */

/* CPF: 11 dígitos, não repetidos, com os dois dígitos verificadores corretos */
export function cpfValido(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  for (let posicao = 9; posicao < 11; posicao++) {
    let soma = 0;
    for (let i = 0; i < posicao; i++) soma += Number(d[i]) * (posicao + 1 - i);
    const digito = (soma * 10) % 11 % 10;
    if (digito !== Number(d[posicao])) return false;
  }
  return true;
}

/* Nome e sobrenome: ao menos duas palavras com duas letras ou mais */
function nomeCompleto(nome) {
  return nome.trim().split(/\s+/).filter((parte) => parte.length >= 2).length >= 2;
}

/* Regras que o HTML não expressa. Só rodam se o formato já estiver certo:
   devolvem a mensagem de erro, ou '' quando está tudo bem. */
const REGRAS = {
  nome: (campo) => (nomeCompleto(campo.value) ? '' : 'Informe nome e sobrenome.'),
  cpf: (campo) => (cpfValido(campo.value)
    ? ''
    : 'Este CPF não existe: confira os números digitados.')
};

/* ---------- Mensagens para os erros do próprio HTML ---------- */

const FORMATO = {
  cpf: 'Informe o CPF completo, no formato 000.000.000-00.',
  telefone: 'Informe o celular com DDD, no formato (00) 00000-0000.',
  cep: 'Informe o CEP no formato 00000-000.',
  senha: 'A senha precisa ter ao menos 8 caracteres, com uma letra e um número.'
};

const FAIXA = {
  nascimento: 'É necessário ter 18 anos completos para se cadastrar.',
  inicio: 'Escolha uma data a partir de hoje.',
  valor: 'O valor mínimo é R$ 20, em múltiplos de R$ 10, até R$ 5.000.',
  horas: 'Informe de 2 a 20 horas semanais.'
};

function mensagemPara(campo) {
  const v = campo.validity;
  if (v.customError) return campo.validationMessage;

  if (v.valueMissing) {
    if (campo.type === 'radio') return 'Escolha uma das opções.';
    if (campo.type === 'checkbox') return 'Marque esta opção para continuar.';
    if (campo.tagName === 'SELECT') return 'Selecione uma opção.';
    return 'Preencha este campo.';
  }
  if (v.badInput) return 'Data ou número incompleto. Confira o que foi digitado.';
  if (v.patternMismatch) return FORMATO[campo.id] || 'O formato não confere com o esperado.';
  if (v.typeMismatch) {
    return campo.type === 'email'
      ? 'Informe um e-mail válido, como nome@provedor.com.br.'
      : 'Informe o endereço completo, começando com https://';
  }
  if (v.tooShort) return 'Use ao menos ' + campo.minLength + ' caracteres (agora: ' + campo.value.length + ').';
  if (v.rangeUnderflow || v.rangeOverflow || v.stepMismatch) {
    return FAIXA[campo.id] || 'Valor fora do intervalo permitido.';
  }
  return 'Confira este campo.';
}

/* ---------- Mensagem injetada no HTML ---------- */

/* Radios do mesmo grupo dividem uma mensagem, colocada no fim do fieldset */
function chave(campo) {
  return campo.type === 'radio' ? campo.name : campo.id;
}

function camposDoGrupo(campo) {
  return campo.type === 'radio'
    ? campo.form.querySelectorAll('input[type="radio"][name="' + campo.name + '"]')
    : [campo];
}

/* Cria (uma vez) o parágrafo de erro do campo e devolve-o */
function elementoMensagem(campo) {
  const id = 'erro-' + chave(campo);
  let mensagem = document.getElementById(id);
  if (mensagem) return mensagem;

  mensagem = document.createElement('p');
  mensagem.id = id;
  mensagem.className = 'mensagem-erro';
  mensagem.hidden = true;

  const bloco = campo.type === 'radio'
    ? campo.closest('fieldset')
    : campo.closest('.campo, .campo-inline');
  bloco.append(mensagem);
  return mensagem;
}

/* Liga ou desliga o id da mensagem no aria-describedby, preservando a dica */
function descrever(campo, id, ligar) {
  const ids = (campo.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== id);
  if (ligar) ids.push(id);
  if (ids.length) campo.setAttribute('aria-describedby', ids.join(' '));
  else campo.removeAttribute('aria-describedby');
}

function exibir(campo) {
  const mensagem = elementoMensagem(campo);
  const valido = campo.validity.valid;

  mensagem.textContent = valido ? '' : mensagemPara(campo);
  mensagem.hidden = valido;

  camposDoGrupo(campo).forEach((item) => {
    if (!valido) item.setAttribute('aria-invalid', 'true');
    else if (item.required) item.setAttribute('aria-invalid', 'false');   // sinal de "certo"
    else item.removeAttribute('aria-invalid');                            // opcional: neutro
    descrever(item, mensagem.id, !valido);
  });
}

/* Roda a regra extra do campo (se houver) e atualiza a validade dele */
function verificar(campo) {
  const regra = REGRAS[campo.id];
  if (!regra) return;
  campo.setCustomValidity('');
  if (campo.validity.valid && campo.value) campo.setCustomValidity(regra(campo));
}

/* ---------- Obrigatoriedade condicional (forma de apoio) ---------- */

function marcarObrigatorio(campo, obrigatorio) {
  campo.required = obrigatorio;
  const rotulo = campo.form.querySelector('label[for="' + campo.id + '"]');
  let asterisco = rotulo.querySelector('abbr');
  if (obrigatorio && !asterisco) {
    asterisco = document.createElement('abbr');
    asterisco.title = 'campo obrigatório';
    asterisco.textContent = '*';
    rotulo.append(' ', asterisco);
  } else if (!obrigatorio && asterisco) {
    asterisco.remove();
    rotulo.textContent = rotulo.textContent.trim();
  }
}

/* Doador exige valor; voluntário exige horas; "ambos" exige os dois */
function aplicarFormaDeApoio(form) {
  const escolha = form.querySelector('input[name="tipo-apoio"]:checked');
  const tipo = escolha ? escolha.value : '';
  marcarObrigatorio(form.elements.valor, tipo === 'doador' || tipo === 'ambos');
  marcarObrigatorio(form.elements.horas, tipo === 'voluntario' || tipo === 'ambos');

  /* Se a mensagem de um deles já estava na tela, ela reflete a nova regra */
  ['valor', 'horas'].forEach((nome) => {
    const campo = form.elements[nome];
    if (campo.hasAttribute('aria-invalid')) exibir(campo);
  });
}

/* ---------- Ponto de entrada ---------- */

/*
  Chamado pelo roteador a cada troca de tela. Em telas sem o formulário de
  cadastro, não faz nada. Precisa rodar antes de aplicarCadastro() (cadastro.js):
  o submit daqui barra o envio inválido antes do envio de lá.
*/
export function aplicarValidacao(raiz) {
  const form = raiz.querySelector('#form-apoio');
  if (!form) return;

  /* As mensagens agora são do script: desliga os balões nativos */
  form.noValidate = true;

  /* Limites de data calculados hoje, e não fixos no HTML */
  form.elements.nascimento.max = limiteMaioridadeISO();
  form.elements.inicio.min = hojeISO();

  const campos = Array.from(form.querySelectorAll('input, select, textarea'));
  const tocados = new Set();

  campos.forEach(verificar);

  /* Primeira saída do campo: passa a ser acompanhado */
  form.addEventListener('focusout', (evento) => {
    const campo = evento.target;
    if (!campos.includes(campo)) return;
    /* Radio: o grupo só é avaliado quando o foco sai do grupo inteiro */
    if (campo.type === 'radio' && evento.relatedTarget && evento.relatedTarget.name === campo.name) return;
    tocados.add(chave(campo));
    verificar(campo);
    exibir(campo);
  });

  /* Correção ao vivo: a mensagem acompanha cada tecla ou clique */
  function aoAlterar(evento) {
    const campo = evento.target;
    if (!campos.includes(campo)) return;
    if (campo.name === 'tipo-apoio') aplicarFormaDeApoio(form);
    verificar(campo);
    if (tocados.has(chave(campo))) exibir(campo);
  }
  form.addEventListener('input', aoAlterar);
  form.addEventListener('change', aoAlterar);

  /* Envio: avalia tudo. Com erro, cancela o envio, mostra todas as
     mensagens e leva o foco ao primeiro campo a corrigir. */
  form.addEventListener('submit', (evento) => {
    campos.forEach((campo) => {
      verificar(campo);
      tocados.add(chave(campo));
      exibir(campo);
    });

    if (!form.checkValidity()) {   // dispara "invalid" em cada campo: monta o resumo
      evento.preventDefault();
      evento.stopImmediatePropagation();   // os ouvintes seguintes (feedback, cadastro) não rodam
      const primeiro = campos.find((campo) => !campo.validity.valid);
      primeiro.focus();
    }
  });

  /* Formulário limpo após o envio: some todo sinal de erro ou acerto */
  form.addEventListener('reset', () => {
    tocados.clear();
    form.querySelectorAll('.mensagem-erro').forEach((mensagem) => {
      mensagem.hidden = true;
      mensagem.textContent = '';
    });
    campos.forEach((campo) => {
      campo.removeAttribute('aria-invalid');
      const ids = (campo.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && !x.startsWith('erro-'));
      if (ids.length) campo.setAttribute('aria-describedby', ids.join(' '));
      else campo.removeAttribute('aria-describedby');
    });
    /* reset devolve os valores só depois deste evento */
    setTimeout(() => {
      aplicarFormaDeApoio(form);
      campos.forEach(verificar);
    }, 0);
  });
}
