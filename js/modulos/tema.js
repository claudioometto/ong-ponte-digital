/*
  Instituto Ponte Digital - tema (claro, escuro, alto contraste)
  ---------------------------------------------------------------
  Responsabilidade deste arquivo: manter <html data-tema> de acordo com o
  seletor "Tema" e com as preferências do sistema. As cores de cada tema
  estão em css/style.css (seção 1b); aqui só se escolhe qual vale.

  O tema da primeira pintura é aplicado pelo script do <head> do index.html,
  com a mesma regra de resolverTema(): este módulo carrega depois e assume
  as mudanças (troca no seletor ou no sistema operacional).
*/

import { ler, gravar, remover } from '../servicos/armazenamento.js';

const TEMAS = ['claro', 'escuro', 'alto-contraste'];
const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');
const sistemaContraste = window.matchMedia('(prefers-contrast: more)');

/* "auto" (ou nada salvo) segue o sistema; contraste alto tem prioridade */
export function resolverTema(escolha) {
  if (TEMAS.includes(escolha)) return escolha;
  if (sistemaContraste.matches) return 'alto-contraste';
  return sistemaEscuro.matches ? 'escuro' : 'claro';
}

function aplicar() {
  const tema = resolverTema(ler('tema', 'auto'));
  document.documentElement.setAttribute('data-tema', tema);
  /* Quem desenha com cores lidas do CSS (o gráfico) se atualiza */
  document.dispatchEvent(new CustomEvent('tema-alterado', { detail: { tema } }));
}

export function iniciarTema() {
  const seletor = document.getElementById('tema');
  if (!seletor) return;

  const escolha = ler('tema', 'auto');
  seletor.value = TEMAS.includes(escolha) ? escolha : 'auto';

  seletor.addEventListener('change', () => {
    if (seletor.value === 'auto') remover('tema');
    else gravar('tema', seletor.value);
    aplicar();
  });

  /* Em "Automático", acompanha a troca feita no sistema com a página aberta */
  sistemaEscuro.addEventListener('change', aplicar);
  sistemaContraste.addEventListener('change', aplicar);
}
