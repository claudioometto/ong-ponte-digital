# Instituto Ponte Digital — plataforma web

Projeto desenvolvido nas Experiências Práticas da disciplina de Desenvolvimento Front-end
(Análise e Desenvolvimento de Sistemas). Simula o site de uma organização do terceiro setor
que forma jovens de periferia em tecnologia.

## Estrutura

A partir da Experiência Prática III, o site é uma SPA (Single Page Application):
um único documento (`index.html`) cujo conteúdo central é trocado pelo JavaScript.

```
ong-ponte-digital/
├── index.html            Casca da SPA: cabeçalho, main#app, rodapé e região de toasts
├── README.md             Este arquivo
├── html/                 Telas da aplicação (fragmentos inseridos em main#app)
│   ├── inicio.html         Apresentação, impacto, como apoiar
│   ├── projetos.html       Projetos sociais, campanhas de doação e voluntariado
│   ├── cadastro.html       Formulário de doadores e voluntários
│   ├── componentes.html    Guia de componentes de feedback (para o back-end)
│   └── nao-encontrada.html Rota inexistente
├── css/
│   └── style.css         Design System (tokens), grade de 12 colunas e componentes
├── imagens/              Logotipo e ornamento (SVG); fotos (JPG + WebP)
└── js/
    ├── app.js            Ponto de entrada: importa e liga os módulos (ordem documentada)
    ├── roteador.js       Lê o hash (#/projetos), busca o fragmento e o insere em main#app
    ├── modulos/          Comportamento da tela (DOM e eventos)
    │   ├── menu.js         Menu hambúrguer e submenu (só alterna aria-expanded)
    │   ├── mascaras.js     Máscaras de CPF, telefone e CEP (só formata)
    │   ├── validacao.js    Regras de consistência e mensagens abaixo de cada campo
    │   ├── persistencia.js Rascunho do cadastro e histórico de envios
    │   ├── cadastro.js     Conduz o envio: botão, api.js, toast de sucesso ou falha
    │   ├── feedback.js     Toast, modal e resumo de erros (API: PonteFeedback.toast / abrirModal)
    │   └── grafico.js      Gráfico de pessoas formadas (Chart.js via CDN, sob demanda)
    ├── servicos/         Rede e armazenamento, sem acesso ao DOM
    │   ├── api.js          enviarCadastro(dados) -> Promise (simulado; vira fetch com back-end)
    │   └── armazenamento.js Único acesso ao localStorage (JSON.stringify/parse + try/catch)
    ├── templates/
    │   ├── renderizar.js   Motor: clona um elemento template e preenche, item a item
    │   └── componentes.js  Cartão de projeto, indicador de impacto e submenu
    └── dados/
        ├── projetos.js     Os 3 projetos (cartões, submenu e gráfico)
        └── impacto.js      Indicadores da tela inicial
```

### Dependências entre módulos

`app.js` → `modulos/` → `templates/`, `servicos/`, `dados/`. Nada importa no sentido contrário
e não há dependência circular. Módulos que não se importam conversam por eventos do DOM
(`envio-concluido`, disparado por `cadastro.js` e ouvido por `persistencia.js`).

### Templates

Componentes repetidos não são escritos à mão nos fragmentos. A marcação fica em elementos
`template` no `index.html` (`tpl-projeto`, `tpl-indicador`), com `data-campo` nos pontos a
preencher; os dados ficam em `js/dados/`. O fragmento marca onde a lista entra com
`data-lista="projetos"`. Para incluir um projeto, basta acrescentar um objeto em
`js/dados/projetos.js`: o cartão e o link do submenu aparecem sozinhos.

### Dados guardados no navegador (localStorage)

| Chave | Conteúdo |
|---|---|
| `ponte-digital:rascunho` | Cadastro em andamento (objeto). Apagado no envio, no "Limpar formulário" e no "Descartar rascunho" |
| `ponte-digital:envios` | Últimos 5 cadastros enviados neste navegador (array): data, nome, forma de apoio, projeto |

Senha, CPF e aceite da LGPD nunca são gravados.

### Biblioteca externa

**Chart.js 4.5.1**, importado como módulo ES de `cdn.jsdelivr.net` por `import()` dinâmico, só na tela
de projetos. Não cria variável global. Sem internet ou com o CDN fora, a tela mostra a tabela com os
mesmos números no lugar do gráfico.

### Rotas

| Endereço | Tela |
|---|---|
| `#/` | Início |
| `#/projetos` | Projetos sociais |
| `#/projetos/doacao` | Projetos sociais, rolada até `id="doacao"` (vale para qualquer id) |
| `#/cadastro` | Cadastro |
| `#/componentes` | Guia de componentes |
| qualquer outro | Página não encontrada |

## Padrões adotados

- **HTML5 semântico**: `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`, `address`.
- **Hierarquia de títulos**: um `h1` por página, sem pular níveis.
- **Acessibilidade**: `lang="pt-BR"`, `alt` em toda imagem (vazio nas decorativas), `aria-labelledby` nas seções, `aria-label` em cada `nav`, `label` vinculado a todo campo por `for`/`id`, foco visível.
- **Imagens**: `<picture>` com WebP e fallback JPG; `width` e `height` declarados para evitar salto de layout.
- **Formulário**: regras de formato no HTML (`required`, `type`, `pattern`, `minlength`, `min`, `max`, `step`) e regras de consistência em `validacao.js` (dígitos verificadores do CPF, nome e sobrenome, idade calculada, valor/horas obrigatórios conforme a forma de apoio), todas pela Constraint Validation API. Erros aparecem escritos abaixo do campo, ligados por `aria-describedby`, com `aria-invalid` controlando o estilo.

## Conformidade

W3C Nu Html Checker (validator.w3.org/nu): **0 erros e 0 avisos** em `index.html` e nos
cinco fragmentos de `html/` (validados dentro da casca, em main#app).

## Como executar

Os scripts são módulos ES e as telas são buscadas com `fetch`; os dois são bloqueados
quando o arquivo é aberto direto do disco (`file://`). Rode um servidor local na pasta do projeto:

- VS Code: extensão Live Server, botão "Go Live"; ou
- terminal: `npx serve` ou `python -m http.server`

Não há etapa de build. A única dependência externa (Chart.js) vem do CDN e é opcional.

## Observação

Organização, endereço, CNPJ, números de impacto e imagens são fictícios, criados para fins acadêmicos.
