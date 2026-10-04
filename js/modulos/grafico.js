/*
  Instituto Ponte Digital - gráfico de resultados (biblioteca Chart.js)
  ---------------------------------------------------------------------
  Responsabilidade deste arquivo: desenhar, na tela de projetos, o gráfico
  de pessoas formadas por projeto, a partir de js/dados/projetos.js.

  Como a biblioteca externa entra sem atrapalhar o resto do site:
    - módulo ES pelo CDN: o Chart.js não cria variável global; só existe
      dentro desta função;
    - import() dinâmico: os ~200 KB só são baixados quando a tela de
      projetos abre, e uma vez só (o navegador guarda o módulo);
    - versão fixada na URL: uma versão nova da biblioteca não muda o site
      sem que alguém troque o número aqui;
    - se o download falhar (sem internet, CDN fora), a tabela com os mesmos
      números se abre no lugar do gráfico e a página segue sem erro.
*/

import { PROJETOS } from '../dados/projetos.js';

const CHART_JS = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/+esm';

/* O gráfico da tela atual; precisa ser destruído quando a tela sai */
let grafico = null;

/* Cores e fonte vêm dos tokens do Design System, lidos do CSS */
function token(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

/* Troca de tema (tema.js): as cores do gráfico vêm dos tokens, então são
   lidas de novo e o gráfico se redesenha sem recriar o canvas */
document.addEventListener('tema-alterado', () => {
  if (!grafico) return;
  const nova = configuracao();
  grafico.data.datasets[0].backgroundColor = nova.data.datasets[0].backgroundColor;
  grafico.data.datasets[0].hoverBackgroundColor = nova.data.datasets[0].hoverBackgroundColor;
  grafico.options.scales = nova.options.scales;
  grafico.update();
});

/* Tabela com os mesmos dados do gráfico (alternativa e reserva) */
function preencherTabela(corpo) {
  corpo.replaceChildren();
  PROJETOS.forEach((projeto) => {
    const linha = corpo.insertRow();
    const nome = document.createElement('th');
    nome.scope = 'row';
    nome.textContent = projeto.nome;
    linha.append(nome);
    linha.insertCell().textContent = projeto.formados;
  });
}

/* Configuração do gráfico de barras horizontais */
function configuracao() {
  /* --texto-sm está em rem; o Chart.js pede pixels */
  const raiz = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const fonte = { family: token('--fonte-base'), size: parseFloat(token('--texto-sm')) * raiz };
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    type: 'bar',
    data: {
      labels: PROJETOS.map((projeto) => projeto.nome),
      datasets: [{
        label: 'Pessoas formadas',
        data: PROJETOS.map((projeto) => projeto.formados),
        backgroundColor: token('--cor-primaria'),
        hoverBackgroundColor: token('--cor-primaria-escura'),
        borderRadius: parseFloat(token('--raio-sm')) * raiz
      }]
    },
    options: {
      indexAxis: 'y',                     // barras deitadas: nomes longos cabem no celular
      maintainAspectRatio: false,         // a altura vem do CSS (.grafico-area)
      animation: semMovimento ? false : { duration: 600 },
      plugins: {
        legend: { display: false },       // uma série só: o título da seção já explica
        tooltip: { callbacks: { label: (item) => item.raw + ' pessoas formadas' } }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: token('--cor-borda') },
          ticks: { color: token('--cor-texto-suave'), font: fonte }
        },
        y: {
          grid: { display: false },
          ticks: { color: token('--cor-texto'), font: fonte }
        }
      }
    }
  };
}

/*
  Chamado pelo roteador a cada troca de tela. Destrói o gráfico anterior
  (o canvas dele já saiu da página) e, se a tela nova tiver um, desenha.
*/
export async function aplicarGrafico(raiz) {
  if (grafico) {
    grafico.destroy();
    grafico = null;
  }

  const canvas = raiz.querySelector('#grafico-formados');
  if (!canvas) return;

  const secao = canvas.closest('section');
  preencherTabela(secao.querySelector('tbody'));

  try {
    const { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } = await import(CHART_JS);

    /* Registra só as peças usadas: barras, eixos de categoria e numérico, dica */
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

    /* A pessoa pode ter trocado de tela durante o download */
    if (!canvas.isConnected) return;

    grafico = new Chart(canvas, configuracao());
  } catch (erro) {
    secao.classList.add('grafico--indisponivel');
    secao.querySelector('details').open = true;
    console.warn('Gráfico indisponível: o Chart.js não carregou. Exibindo a tabela.', erro);
  }
}
