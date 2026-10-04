/*
  Instituto Ponte Digital - componentes de feedback
  -------------------------------------------------
  Responsabilidade deste arquivo: criar, mostrar e remover toasts, abrir
  modais e montar o resumo de erros do cadastro. A aparência é toda do CSS.

  API para o back-end (também disponível pelos atributos data-*):
    PonteFeedback.toast(tipo, titulo, texto)   tipo: sucesso | erro | aviso | info
    PonteFeedback.abrirModal(id)
*/

(function () {
  'use strict';

  var DURACAO_TOAST = 8000;
  var regiao = document.querySelector('.toasts');

  /* ---------- Toast ---------- */

  function toast(tipo, titulo, texto) {
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
    item.addEventListener('focusin', function () { clearTimeout(timer); });
    item.addEventListener('mouseleave', agendar);
    item.addEventListener('focusout', agendar);
    agendar();
  }

  /* ---------- Modal ---------- */

  function abrirModal(id) {
    var dialogo = document.getElementById(id);
    if (dialogo && typeof dialogo.showModal === 'function') dialogo.showModal();
  }

  /* Clique no fundo escuro fecha: o alvo é o próprio dialog, não a caixa */
  document.querySelectorAll('dialog.modal').forEach(function (dialogo) {
    dialogo.addEventListener('click', function (evento) {
      if (evento.target === dialogo) dialogo.close();
    });
  });

  /* ---------- Gatilhos declarativos ---------- */

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
      if (caixa.classList.contains('toast')) caixa.remove();
      else caixa.hidden = true;
    }
  });

  /* ---------- Formulário de cadastro ---------- */

  var form = document.getElementById('form-apoio');
  var resumo = document.getElementById('resumo-erros');

  if (form && resumo) {
    var textoResumo = resumo.querySelector('.alerta-texto');
    var montando = false;

    /* O navegador dispara "invalid" em cada campo com problema quando alguém
       tenta enviar. Juntamos todos numa única mensagem no topo do formulário. */
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

    /* "submit" só dispara com o formulário válido. Sem back-end, o envio é
       simulado; na integração, troque o setTimeout por um fetch ao servidor. */
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      resumo.hidden = true;

      var botao = form.querySelector('button[type="submit"]');
      var rotulo = botao.textContent;
      botao.disabled = true;
      botao.textContent = 'Enviando…';

      setTimeout(function () {
        botao.disabled = false;
        botao.textContent = rotulo;
        form.reset();
        toast('sucesso', 'Cadastro enviado',
              'Obrigado! Em até 2 dias úteis a coordenação entra em contato pelo e-mail informado.');
      }, 1200);
    });
  }

  window.PonteFeedback = { toast: toast, abrirModal: abrirModal };
})();
