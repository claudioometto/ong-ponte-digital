/*
  Instituto Ponte Digital - envio do cadastro
  -------------------------------------------
  Responsabilidade deste arquivo: conduzir o envio de um formulário que
  já passou pela validação. Ele não valida (validacao.js), não guarda
  (persistencia.js) e não fala com o servidor (servicos/api.js): só liga
  essas peças na ordem certa e cuida do botão e da resposta à pessoa.
*/

import { enviarCadastro } from '../servicos/api.js';
import { toast } from './feedback.js';

/* FormData -> objeto; campos com o mesmo nome (checkbox "frentes") viram lista */
function dadosDoFormulario(form) {
  const dados = {};
  for (const [nome, valor] of new FormData(form)) {
    dados[nome] = nome in dados ? [].concat(dados[nome], valor) : valor;
  }
  return dados;
}

/*
  Chamado pelo roteador a cada troca de tela, por último: o submit daqui
  só roda se o de validacao.js não tiver barrado o envio.
*/
export function aplicarCadastro(raiz) {
  const form = raiz.querySelector('#form-apoio');
  if (!form) return;

  let enviando = false;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();   // a SPA envia por script; o navegador não recarrega
    if (enviando) return;      // evita envio duplicado por clique ou Enter repetido

    /* aria-disabled em vez de disabled: um botão disabled perde o foco e quem
       usa teclado ou leitor de tela ficava "no nada" (body) durante o envio. */
    const botao = form.querySelector('button[type="submit"]');
    const rotulo = botao.textContent;
    enviando = true;
    botao.setAttribute('aria-disabled', 'true');
    botao.textContent = 'Enviando…';

    try {
      const resposta = await enviarCadastro(dadosDoFormulario(form));

      /* Avisa quem precisa registrar o envio (persistencia.js) antes de limpar */
      form.dispatchEvent(new CustomEvent('envio-concluido', { detail: resposta }));
      form.reset();
      toast('sucesso', 'Cadastro enviado',
            'Protocolo ' + resposta.protocolo + '. Em até 2 dias úteis a coordenação entra em contato pelo e-mail informado.');
    } catch (erro) {
      /* Falha de rede: nada é apagado, a pessoa só tenta de novo */
      toast('erro', 'Não foi possível enviar',
            'Verifique sua conexão e tente novamente. O que você preencheu continua no formulário.');
    } finally {
      enviando = false;
      botao.removeAttribute('aria-disabled');
      botao.textContent = rotulo;
    }
  });
}
