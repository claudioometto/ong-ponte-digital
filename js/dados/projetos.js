/*
  Instituto Ponte Digital - dados dos projetos sociais
  ----------------------------------------------------
  Fonte única dos projetos: alimenta os cartões da tela de projetos e os
  links do submenu do cabeçalho. Projeto novo = um objeto novo nesta lista.

  badges[].tipo: sucesso | aviso | erro | info | destaque | '' (neutro)
  O id vira a âncora do cartão (#/projetos/<id>).
*/

export const PROJETOS = [
  {
    id: 'codigo-na-quebrada',
    nome: 'Código na Quebrada',
    formados: 186,   // pessoas formadas em 2025, usado no gráfico
    badges: [
      { texto: 'Inscrições abertas', tipo: 'sucesso' },
      { texto: '9 meses', tipo: '' },
      { texto: '16 a 24 anos', tipo: 'info' }
    ],
    imagem: {
      arquivo: 'projeto-1',
      alt: 'Turma de jovens em aula de programação no núcleo do Jardim São Marcos'
    },
    legenda: 'Turma 2025.2 do núcleo Jardim São Marcos.',
    descricao: 'Trilha de 9 meses em desenvolvimento web (HTML, CSS, JavaScript e versionamento), ' +
               'com 6 horas semanais presenciais e notebook emprestado durante todo o curso.',
    publico: 'Jovens de 16 a 24 anos matriculados ou egressos da rede pública de ensino.',
    resultados: [
      '186 jovens formados em 4 turmas;',
      '71% de conclusão (média do setor: 48%);',
      '54 contratações como aprendiz ou estagiário.'
    ]
  },
  {
    id: 'dados-que-transformam',
    nome: 'Dados que Transformam',
    formados: 142,   // pessoas formadas em 2025, usado no gráfico
    badges: [
      { texto: 'Últimas vagas', tipo: 'aviso' },
      { texto: '6 meses', tipo: '' },
      { texto: '18 a 29 anos', tipo: 'info' }
    ],
    imagem: {
      arquivo: 'projeto-2',
      alt: 'Participantes analisando planilhas durante oficina de dados'
    },
    legenda: 'Oficina de análise de dados no núcleo Vila Aurora.',
    descricao: 'Formação de 6 meses em análise de dados com planilhas, SQL e visualização, voltada a quem ' +
               'já concluiu o ensino médio e busca requalificação.',
    publico: 'Pessoas de 18 a 29 anos em situação de desemprego ou trabalho informal.',
    resultados: [
      '142 participantes formados;',
      '38 encaminhados a vagas júnior em empresas parceiras;',
      '3 projetos de dados entregues a associações de bairro.'
    ]
  },
  {
    id: 'maes-conectadas',
    nome: 'Mães Conectadas',
    formados: 84,    // pessoas formadas em 2025, usado no gráfico
    badges: [
      { texto: 'Turma lotada', tipo: 'erro' },
      { texto: 'Acolhimento infantil', tipo: 'destaque' },
      { texto: 'Turma noturna', tipo: '' }
    ],
    imagem: {
      arquivo: 'projeto-3',
      alt: 'Mães participando de aula de informática básica com apoio de monitora'
    },
    legenda: 'Turma noturna com serviço de acolhimento infantil no mesmo espaço.',
    descricao: 'Curso de informática essencial e serviços digitais públicos (Gov.br, agendamento de saúde, ' +
               'currículo online), com acolhimento infantil durante as aulas.',
    publico: 'Mães e responsáveis com filhos menores de 12 anos, sem restrição de idade.',
    resultados: [
      '84 participantes formadas;',
      '2 turmas noturnas com acolhimento infantil;',
      '96% de avaliação positiva na pesquisa de satisfação.'
    ]
  }
];
