/*
  Instituto Ponte Digital - componentes gerados a partir de dados
  ---------------------------------------------------------------
  Cada função "preencher" recebe a cópia de um template e um objeto de
  dados, e coloca cada valor no seu lugar. renderizarComponentes() procura
  na tela os contêineres marcados com data-lista e preenche cada um.
*/

import { campo, renderizarLista } from './renderizar.js';
import { PROJETOS } from '../dados/projetos.js';
import { IMPACTO } from '../dados/impacto.js';

/* ---------- Cartão de projeto ---------- */

function preencherProjeto(copia, projeto) {
  copia.querySelector('article').id = projeto.id;
  campo(copia, 'nome').textContent = projeto.nome;

  projeto.badges.forEach((badge) => {
    const li = document.createElement('li');
    li.className = badge.tipo ? 'badge badge--' + badge.tipo : 'badge';
    li.textContent = badge.texto;
    campo(copia, 'badges').append(li);
  });

  /* Gerados por scripts/imagens.mjs na largura dos cartões (480px) */
  const base = 'imagens/' + projeto.imagem.arquivo + '-480';
  campo(copia, 'imagem-avif').srcset = base + '.avif';
  campo(copia, 'imagem-webp').srcset = base + '.webp';
  const img = campo(copia, 'imagem');
  img.src = base + '.jpg';
  img.alt = projeto.imagem.alt;
  campo(copia, 'legenda').textContent = projeto.legenda;

  campo(copia, 'descricao').textContent = projeto.descricao;
  campo(copia, 'publico').textContent = projeto.publico;

  projeto.resultados.forEach((texto) => {
    const li = document.createElement('li');
    li.textContent = texto;
    campo(copia, 'resultados').append(li);
  });

  campo(copia, 'apoiar').textContent = 'Apoiar o ' + projeto.nome;
}

/* ---------- Cartão de indicador ---------- */

function preencherIndicador(copia, indicador) {
  campo(copia, 'titulo').textContent = indicador.titulo;
  const valor = campo(copia, 'valor');
  valor.textContent = indicador.valor;
  valor.after(' ' + indicador.texto);   // string vira nó de texto, sem interpretar HTML
}

/* ---------- Registro: data-lista -> template, dados e preenchimento ---------- */

const LISTAS = {
  projetos: { template: 'tpl-projeto', dados: PROJETOS, preencher: preencherProjeto },
  impacto: { template: 'tpl-indicador', dados: IMPACTO, preencher: preencherIndicador }
};

/* Chamado pelo roteador a cada troca de tela, antes de rolar até a âncora */
export function renderizarComponentes(tela) {
  tela.querySelectorAll('[data-lista]').forEach((destino) => {
    const lista = LISTAS[destino.dataset.lista];
    if (lista) renderizarLista(destino, lista.template, lista.dados, lista.preencher);
  });
}

/* Submenu "Projetos sociais" do cabeçalho: um link por projeto, antes dos
   links fixos de doação e voluntariado. Roda uma vez, porque o cabeçalho é fixo. */
export function preencherSubmenuProjetos() {
  const submenu = document.getElementById('submenu-projetos');
  if (!submenu) return;

  const lote = document.createDocumentFragment();
  PROJETOS.forEach((projeto) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#/projetos/' + projeto.id;
    link.textContent = projeto.nome;
    li.append(link);
    lote.append(li);
  });
  submenu.prepend(lote);
}
