/*
  Instituto Ponte Digital - menu de navegação responsivo
  ------------------------------------------------------
  Responsabilidade deste arquivo: APENAS alternar o atributo aria-expanded
  dos botões do menu. Toda a aparência (ocultar, mostrar, animar) é do CSS,
  que lê esse atributo. Sem este script, o menu fica sempre aberto e os
  submenus abrem por :hover e :focus-within — nenhum link se perde.
*/

(function () {
  'use strict';

  var desktop = window.matchMedia('(min-width: 48em)');
  var nav = document.querySelector('.nav-principal');
  if (!nav) return;

  var botaoMenu = nav.querySelector('.menu-botao');
  var botoesSubmenu = nav.querySelectorAll('.submenu-botao');

  function estaAberto(botao) {
    return botao.getAttribute('aria-expanded') === 'true';
  }

  function definir(botao, aberto) {
    botao.setAttribute('aria-expanded', String(aberto));
  }

  function fecharTudo() {
    definir(botaoMenu, false);
    botoesSubmenu.forEach(function (botao) { definir(botao, false); });
  }

  /* Hambúrguer: abre e fecha o painel do celular */
  botaoMenu.addEventListener('click', function () {
    definir(botaoMenu, !estaAberto(botaoMenu));
  });

  botoesSubmenu.forEach(function (botao) {
    var item = botao.closest('.tem-submenu');

    /* Seta ao lado do link: abre e fecha o submenu por clique ou toque */
    botao.addEventListener('click', function () {
      definir(botao, !estaAberto(botao));
    });

    /* No desktop, o submenu acompanha o foco do teclado: abre quando o foco
       entra no item e fecha quando sai. O próprio botão fica de fora, senão
       o foco do clique abriria e o clique fecharia logo em seguida. */
    item.addEventListener('focusin', function (evento) {
      if (desktop.matches && evento.target !== botao) definir(botao, true);
    });

    item.addEventListener('focusout', function (evento) {
      if (!item.contains(evento.relatedTarget)) definir(botao, false);
    });
  });

  /* Esc fecha o que estiver aberto e devolve o foco ao botão que o abriu */
  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') return;
    var abertos = nav.querySelectorAll('[aria-expanded="true"]');
    if (!abertos.length) return;
    var ultimo = abertos[abertos.length - 1];
    definir(ultimo, false);
    ultimo.focus();
  });

  /* Clique fora da navegação ou em um link dela fecha tudo */
  document.addEventListener('click', function (evento) {
    if (!nav.contains(evento.target) || evento.target.closest('a')) fecharTudo();
  });

  /* Ao cruzar o ponto de quebra de 768px, o menu recomeça fechado */
  desktop.addEventListener('change', fecharTudo);
})();
