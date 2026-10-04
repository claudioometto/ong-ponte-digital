/*
  Instituto Ponte Digital - comunicação com o servidor
  ----------------------------------------------------
  Responsabilidade deste arquivo: falar com o back-end. Não conhece o DOM:
  recebe dados prontos e devolve uma Promise. Quem chama não sabe (nem
  precisa saber) se a resposta veio de um servidor ou de uma simulação.

  Ainda não há back-end: o envio é simulado com um atraso de rede. Na
  integração, só o miolo de enviarCadastro() vira um fetch, por exemplo:

    const resposta = await fetch('/api/cadastros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    return resposta.json();
*/

const ATRASO_SIMULADO = 1200;

/* Resolve com { protocolo, recebidoEm }; rejeita sem conexão, como um fetch real */
export function enviarCadastro(dados) {
  return new Promise((resolver, rejeitar) => {
    setTimeout(() => {
      if (!navigator.onLine) {
        rejeitar(new Error('Sem conexão com a internet'));
        return;
      }
      resolver({
        protocolo: 'PD-' + Date.now().toString(36).toUpperCase(),
        recebidoEm: new Date().toISOString(),
        campos: Object.keys(dados).length
      });
    }, ATRASO_SIMULADO);
  });
}
