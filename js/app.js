/*
  Instituto Ponte Digital - ponto de entrada da aplicação
  -------------------------------------------------------
  Responsabilidade deste arquivo: importar os módulos e ligá-los na ordem
  certa. Nenhuma regra de negócio mora aqui.

  Camadas e direção das dependências (nada importa no sentido contrário):

    app.js ──> roteador.js
           └─> modulos/    comportamento da tela (DOM e eventos)
                 └─> templates/   gerar elementos a partir de dados
                 └─> servicos/    rede e armazenamento, sem DOM
                 └─> dados/       conteúdo puro, sem lógica

  - O que vale para o site inteiro (menu, toasts) é iniciado uma vez.
  - O que depende do conteúdo da tela é preparado a cada troca, porque o
    roteador substitui o HTML de main#app.
*/

import { iniciarMenu } from './modulos/menu.js';
import { iniciarFeedback, prepararTela } from './modulos/feedback.js';
import { aplicarMascaras } from './modulos/mascaras.js';
import { aplicarValidacao } from './modulos/validacao.js';
import { aplicarPersistencia } from './modulos/persistencia.js';
import { aplicarCadastro } from './modulos/cadastro.js';
import { aplicarGrafico } from './modulos/grafico.js';
import { renderizarComponentes, preencherSubmenuProjetos } from './templates/componentes.js';
import { iniciarRoteador } from './roteador.js';

preencherSubmenuProjetos();
iniciarMenu();
iniciarFeedback();

iniciarRoteador({
  alvo: document.getElementById('app'),

  /* A ordem importa: os três ouvintes de submit do formulário rodam na
     ordem em que são registrados (validação -> resumo -> envio). */
  aoCarregar(tela) {
    renderizarComponentes(tela);   // cartões antes de tudo: o roteador rola até eles
    aplicarGrafico(tela);          // assíncrona: baixa o Chart.js sem travar a tela
    aplicarMascaras(tela);
    aplicarValidacao(tela);        // 1º submit: barra o envio inválido
    aplicarPersistencia(tela);     // depois da validação: o rascunho restaurado já é verificado
    prepararTela(tela);            // 2º submit: esconde o resumo de erros
    aplicarCadastro(tela);         // 3º submit: envia pela api.js
  }
});
