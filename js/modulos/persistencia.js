/*
  Instituto Ponte Digital - rascunho e histórico do cadastro
  ----------------------------------------------------------
  Responsabilidade deste arquivo: lembrar o cadastro entre visitas.

    rascunho  (objeto) o que foi digitado e ainda não enviado. Gravado a
              cada alteração; devolvido aos campos ao abrir a tela;
              apagado no envio, no "Limpar formulário" e no "Descartar".
    envios    (array)  um registro por cadastro enviado neste navegador,
              listado ao lado do formulário com o template tpl-envio.

  Nunca são gravados: senha (o localStorage é texto puro, legível por
  qualquer script da página), CPF (dado pessoal sensível, LGPD) e o aceite
  da LGPD (o consentimento precisa ser dado de novo a cada envio).
*/

import { ler, gravar, remover } from '../servicos/armazenamento.js';
import { campo, renderizarLista } from '../templates/renderizar.js';
import { moverFoco, toast } from './feedback.js';

const NAO_GRAVAR = ['cpf', 'senha', 'lgpd'];
const LIMITE_ENVIOS = 5;

/* ---------- Formulário -> objeto -> formulário ---------- */

/* Campos com nome que podem ser guardados (sem botões e sem os sensíveis) */
function camposGravaveis(form) {
  return Array.from(form.elements).filter((item) =>
    item.name && !NAO_GRAVAR.includes(item.name) && item.type !== 'submit' && item.type !== 'reset' && item.type !== 'button');
}

/* Radio guarda o valor escolhido; checkbox, a lista dos marcados (o grupo
   "frentes" tem vários com o mesmo nome); os demais, o texto digitado. */
function lerFormulario(form) {
  const dados = {};
  camposGravaveis(form).forEach((item) => {
    if (item.type === 'radio') {
      if (item.checked) dados[item.name] = item.value;
    } else if (item.type === 'checkbox') {
      dados[item.name] = dados[item.name] || [];
      if (item.checked) dados[item.name].push(item.value);
    } else {
      dados[item.name] = item.value;
    }
  });
  return dados;
}

/* Há algo além de campos vazios? Rascunho vazio não merece ser guardado */
function temConteudo(dados) {
  return Object.values(dados).some((valor) => (Array.isArray(valor) ? valor.length : valor !== ''));
}

function preencherFormulario(form, dados) {
  camposGravaveis(form).forEach((item) => {
    if (!(item.name in dados)) return;
    const valor = dados[item.name];
    if (item.type === 'radio') item.checked = item.value === valor;
    else if (item.type === 'checkbox') item.checked = valor.includes(item.value);
    else item.value = valor;
  });

  /* Avisa o validacao.js sobre a forma de apoio restaurada: ele religa o
     required do valor ou das horas e devolve o asterisco ao rótulo. */
  const apoio = form.querySelector('input[name="tipo-apoio"]:checked');
  if (apoio) apoio.dispatchEvent(new Event('change', { bubbles: true }));
}

/* ---------- Histórico de envios ---------- */

function textoDaOpcao(form, nome) {
  const escolhido = form.querySelector('input[name="' + nome + '"]:checked');
  return escolhido ? form.querySelector('label[for="' + escolhido.id + '"]').textContent.trim() : '';
}

function registrarEnvio(form, resposta) {
  const envio = {
    data: resposta.recebidoEm,
    protocolo: resposta.protocolo,
    nome: form.elements.nome.value.trim(),
    apoio: textoDaOpcao(form, 'tipo-apoio'),
    projeto: form.elements.projeto.selectedOptions[0].textContent.trim()
  };
  const envios = ler('envios', []);
  envios.unshift(envio);                          // mais recente primeiro
  gravar('envios', envios.slice(0, LIMITE_ENVIOS));
}

function preencherEnvio(copia, envio) {
  const data = new Date(envio.data);
  campo(copia, 'data').textContent = data.toLocaleDateString('pt-BR') + ', ' +
    data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
    (envio.protocolo ? ' · ' + envio.protocolo : '');
  campo(copia, 'nome').textContent = envio.nome;
  campo(copia, 'detalhe').textContent = envio.apoio + ' · ' + envio.projeto;
}

function mostrarEnvios(secao) {
  const envios = ler('envios', []);
  const lista = secao.querySelector('ul');
  lista.replaceChildren();
  renderizarLista(lista, 'tpl-envio', envios, preencherEnvio);
  secao.hidden = envios.length === 0;
}

/* ---------- Ponto de entrada ---------- */

/*
  Chamado pelo roteador a cada troca de tela, depois de aplicarValidacao():
  o "change" disparado na restauração precisa encontrar o ouvinte dela.
*/
export function aplicarPersistencia(raiz) {
  const form = raiz.querySelector('#form-apoio');
  if (!form) return;

  const aviso = raiz.querySelector('#aviso-rascunho');
  const secaoEnvios = raiz.querySelector('#meus-envios');

  /* Carregamento: devolve o rascunho aos campos e monta o histórico */
  const rascunho = ler('rascunho', null);
  if (rascunho && temConteudo(rascunho)) {
    preencherFormulario(form, rascunho);
    aviso.hidden = false;
  }
  mostrarEnvios(secaoEnvios);

  /* Cada alteração regrava o rascunho inteiro (é pequeno: poucos campos) */
  function salvarRascunho() {
    const dados = lerFormulario(form);
    if (temConteudo(dados)) gravar('rascunho', dados);
    else remover('rascunho');
  }
  form.addEventListener('input', salvarRascunho);
  form.addEventListener('change', salvarRascunho);

  /* "Limpar formulário", "Descartar rascunho" e o envio terminam em reset */
  form.addEventListener('reset', () => {
    remover('rascunho');
    aviso.hidden = true;
  });

  /* O aviso some com o reset, levando o botão junto: o foco vai ao primeiro
     campo, onde a pessoa recomeça (sem isto, caía no body) */
  raiz.querySelector('#descartar-rascunho').addEventListener('click', () => {
    form.reset();
    moverFoco(form.querySelector('input, select, textarea'));
  });

  /* cadastro.js avisa quando o servidor confirma o envio, antes de limpar */
  form.addEventListener('envio-concluido', (evento) => {
    registrarEnvio(form, evento.detail);
    mostrarEnvios(secaoEnvios);
  });

  /* A seção do histórico some: o foco sobe para o título da coluna lateral */
  raiz.querySelector('#apagar-envios').addEventListener('click', () => {
    remover('envios');
    mostrarEnvios(secaoEnvios);
    moverFoco(secaoEnvios.closest('aside').querySelector('h2'));
    toast('info', 'Histórico apagado', 'Os envios deste navegador foram removidos.');
  });
}
