/*
  Instituto Ponte Digital - componentes de feedback
  -------------------------------------------------
  Responsabilidade deste arquivo: criar, mostrar e remover toasts, abrir
  modais e montar o resumo de erros do cadastro. Só interface: nada de
  rede nem de armazenamento. A aparência é toda do CSS.

  API para o back-end (também disponível pelos atributos data-*):
    PonteFeedback.toast(tipo, titulo, texto)   tipo: sucesso | erro | aviso | info
    PonteFeedback.abrirModal(id)

  Na SPA, a região de toasts fica fixa em index.html: iniciarFeedback() roda
  uma vez. Modais e formulário vêm com a tela: prepararTela() roda a cada troca.
*/

var DURACAO_TOAST = 8000;

/* ---------- Toast ---------- */

export function toast(tipo, titulo, texto) {
  var regiao = document.querySelector('.toasts');
  if (!regiao) return;

  var item = document.createElement('div');
  item.className = 'toast toast--' + tipo;

  var elTitulo = document.createElement('p');
  elTitulo.className = 'toast-titulo';
  elTitulo.textContent = titulo;

  var elTexto = document.createElement('p');
  elTexto.textContent = texto;

  var fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'botao-fechar';
  fechar.innerHTML = '<span aria-hidden="true">&times;</span>' +
                     '<span class="visually-hidden">Fechar notificação</span>';

  item.append(elTitulo, elTexto, fechar);
  regiao.appendChild(item);

  /* Some sozinho, mas a contagem pausa enquanto o mouse ou o foco
     estão sobre ele: ninguém perde a mensagem no meio da leitura. */
  var timer;
  function remover() { clearTimeout(timer); item.remove(); }
  function agendar() { clearTimeout(timer); timer = setTimeout(remover, DURACAO_TOAST); }

  item.addEventListener('mouseenter', function () { clearTimeout(timer); });
  item.addEventListener('focusin', function (evento) {
    clearTimeout(timer);
    /* Guarda de onde o foco veio, para devolvê-lo quando o toast fechar */
    if (!item.contains(evento.relatedTarget)) item.origemFoco = evento.relatedTarget;
  });
  item.addEventListener('mouseleave', agendar);
  item.addEventListener('focusout', agendar);
  agendar();
}

/* ---------- Modal ---------- */

export function abrirModal(id) {
  var dialogo = document.getElementById(id);
  if (dialogo && typeof dialogo.showModal === 'function') dialogo.showModal();
}

/* ---------- Foco ao fechar ---------- */

/* Move o foco por script. Título ou contêiner ganha tabindex="-1": recebe o
   foco sem entrar na ordem do Tab. */
export function moverFoco(elemento) {
  if (!elemento.matches('a[href], button, input, select, textarea, [tabindex]')) {
    elemento.setAttribute('tabindex', '-1');
  }
  elemento.focus();
}

/* Para onde o foco vai quando um toast ou alerta fecha: de onde a pessoa
   veio (toast), o título da seção do alerta, ou o conteúdo principal. */
function destinoDoFoco(caixa) {
  if (!caixa.contains(document.activeElement)) return null; // fechou com o mouse
  if (caixa.origemFoco && caixa.origemFoco.isConnected) return caixa.origemFoco;
  var secao = caixa.closest('section');
  var titulo = secao && secao.querySelector('h1, h2, h3');
  return titulo || document.getElementById('app');
}

/* ---------- Gatilhos declarativos (site inteiro, uma vez) ---------- */

export function iniciarFeedback() {
  /* Um ouvinte só no document atende também os botões das telas que o
     roteador ainda vai carregar: o clique sobe até ele (delegação). */
  document.addEventListener('click', function (evento) {
    var alvo = evento.target;

    var gatilhoModal = alvo.closest('[data-abre-modal]');
    if (gatilhoModal) abrirModal(gatilhoModal.getAttribute('data-abre-modal'));

    var gatilhoToast = alvo.closest('[data-toast]');
    if (gatilhoToast) {
      toast(gatilhoToast.getAttribute('data-toast'),
            gatilhoToast.getAttribute('data-toast-titulo'),
            gatilhoToast.getAttribute('data-toast-texto'));
    }

    /* Botão de fechar de toast e de alerta fechável */
    var fechar = alvo.closest('.toast .botao-fechar, .alerta .botao-fechar');
    if (fechar) {
      var caixa = fechar.closest('.toast, .alerta');
      var destino = destinoDoFoco(caixa);
      if (caixa.classList.contains('toast')) caixa.remove();
      else caixa.hidden = true;
      /* O botão sumiu junto com a caixa: sem isto, o foco caía no body */
      if (destino) moverFoco(destino);
    }
  });

  window.PonteFeedback = { toast: toast, abrirModal: abrirModal };
}

/* ---------- Itens da tela atual (a cada troca de tela) ---------- */

export function prepararTela(raiz) {
  /* Clique no fundo escuro fecha: o alvo é o próprio dialog, não a caixa */
  raiz.querySelectorAll('dialog.modal').forEach(function (dialogo) {
    dialogo.addEventListener('click', function (evento) {
      if (evento.target === dialogo) dialogo.close();
    });
  });

  /* Formulário de cadastro */
  var form = raiz.querySelector('#form-apoio');
  var resumo = raiz.querySelector('#resumo-erros');

  if (form && resumo) {
    var textoResumo = resumo.querySelector('.alerta-texto');
    var montando = false;

    /* checkValidity() (em validacao.js) dispara "invalid" em cada campo com
       problema. Juntamos todos numa única mensagem no topo do formulário. */
    form.addEventListener('invalid', function () {
      if (montando) return;
      montando = true;
      setTimeout(function () {
        montando = false;
        var grupos = {};
        form.querySelectorAll('input, select, textarea').forEach(function (campo) {
          if (!campo.validity.valid) grupos[campo.name || campo.id] = true;
        });
        var total = Object.keys(grupos).length;
        textoResumo.textContent = total === 1
          ? '1 campo precisa de correção. Ele está destacado em vermelho, com a orientação logo abaixo.'
          : total + ' campos precisam de correção. Eles estão destacados em vermelho, com a orientação logo abaixo.';
        resumo.hidden = false;
      }, 0);
    }, true);

    /* Este submit só chega aqui com o formulário válido (validacao.js barra
       antes o envio com erro): o resumo da tentativa anterior sai de cena.
       O envio em si é de cadastro.js. */
    form.addEventListener('submit', function () {
      resumo.hidden = true;
    });
  }
}
