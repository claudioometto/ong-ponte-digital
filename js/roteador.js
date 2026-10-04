/*
  Instituto Ponte Digital - roteador da SPA
  -----------------------------------------
  Responsabilidade deste arquivo: ler o hash da URL, buscar o fragmento da
  tela correspondente na pasta html/ e colocá-lo dentro de main#app, sem
  recarregar a página. Cabeçalho, rodapé e região de toasts ficam fixos.

  Formato das rotas:
    #/                     tela inicial
    #/projetos             tela de projetos
    #/projetos/doacao      tela de projetos, rolada até o elemento id="doacao"
*/

const ROTAS = {
  '': {
    arquivo: 'inicio',
    titulo: 'Instituto Ponte Digital | Educação em tecnologia para a juventude periférica',
    descricao: 'Instituto Ponte Digital: ONG que forma jovens de 14 a 24 anos das periferias de Campinas em tecnologia e os conecta ao primeiro emprego.'
  },
  projetos: {
    arquivo: 'projetos',
    titulo: 'Projetos sociais | Instituto Ponte Digital',
    descricao: 'Projetos sociais do Instituto Ponte Digital: conheça as iniciativas, as campanhas de doação e as frentes de voluntariado disponíveis.'
  },
  cadastro: {
    arquivo: 'cadastro',
    titulo: 'Seja apoiador | Instituto Ponte Digital',
    descricao: 'Cadastre-se como doador ou voluntário do Instituto Ponte Digital e apoie a formação de jovens em tecnologia.'
  },
  componentes: {
    arquivo: 'componentes',
    titulo: 'Guia de componentes | Instituto Ponte Digital',
    descricao: 'Guia de componentes de feedback do Instituto Ponte Digital: badges, alertas, toast e modal, com o código de uso.'
  }
};

const NAO_ENCONTRADA = {
  arquivo: 'nao-encontrada',
  titulo: 'Página não encontrada | Instituto Ponte Digital',
  descricao: 'O endereço acessado não existe no site do Instituto Ponte Digital.'
};

/* "#/projetos/doacao" -> { nome: 'projetos', ancora: 'doacao' } */
function lerHash() {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  return { nome: partes[0] || '', ancora: partes[1] || '' };
}

/* Marca no menu e no rodapé o link da tela atual (aria-current) */
function marcarLinkAtual(nome) {
  document.querySelectorAll('nav a[href^="#/"]').forEach((link) => {
    if (link.getAttribute('href') === '#/' + nome) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

/* Leva a pessoa ao ponto certo da tela: a âncora pedida ou o h1.
   Mover o foco faz o leitor de tela anunciar a troca de conteúdo e faz o
   próximo Tab seguir dali, como numa âncora comum. tabindex="-1" deixa
   seção e título receberem foco por script sem entrar na ordem do Tab. */
function focar(elemento) {
  if (!elemento.matches('a[href], input, select, textarea, button')) elemento.setAttribute('tabindex', '-1');
  elemento.focus({ preventScroll: true });
}

function posicionar(alvo, ancora, moverFoco) {
  const destino = ancora ? document.getElementById(ancora) : null;
  if (destino) {
    destino.scrollIntoView();
    focar(destino);
    return;
  }
  window.scrollTo(0, 0);
  if (!moverFoco) return;
  const titulo = alvo.querySelector('h1');
  if (titulo) focar(titulo);
}

export function iniciarRoteador({ alvo, aoCarregar }) {
  let telaAtual = null;
  let pedido = 0;   // descarta respostas de cliques anteriores que chegarem atrasadas
  let primeiraCarga = true;

  async function navegar() {
    const { nome, ancora } = lerHash();

    /* Mesma tela, outra âncora: só rola, sem buscar o fragmento de novo */
    if (nome === telaAtual) {
      posicionar(alvo, ancora, true);
      return;
    }

    const rota = ROTAS[nome] || NAO_ENCONTRADA;
    const numero = ++pedido;
    alvo.setAttribute('aria-busy', 'true');

    try {
      const resposta = await fetch('html/' + rota.arquivo + '.html');
      if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
      const html = await resposta.text();
      if (numero !== pedido) return;

      alvo.innerHTML = html;
      telaAtual = nome;
      document.title = rota.titulo;
      document.querySelector('meta[name="description"]').setAttribute('content', rota.descricao);
      marcarLinkAtual(ROTAS[nome] ? nome : null);
      aoCarregar(alvo, nome);
      posicionar(alvo, ancora, !primeiraCarga);
    } catch (erro) {
      if (numero !== pedido) return;
      alvo.innerHTML =
        '<section><h1>Não foi possível carregar esta página</h1>' +
        '<p>Verifique a conexão e tente de novo. Se você abriu o arquivo direto do computador, ' +
        'rode o projeto em um servidor local (veja o README.md).</p></section>';
      telaAtual = null;
      console.error('Roteador: falha ao carregar html/' + rota.arquivo + '.html', erro);
    } finally {
      if (numero === pedido) {
        alvo.removeAttribute('aria-busy');
        primeiraCarga = false;
      }
    }
  }

  window.addEventListener('hashchange', navegar);
  navegar();
}
