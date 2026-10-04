# Instituto Ponte Digital — plataforma web

Site institucional de uma organização do terceiro setor que forma jovens de 14 a 24 anos das
periferias de Campinas/SP em tecnologia. É uma SPA (Single Page Application) em HTML, CSS e
JavaScript puros, sem framework, com cadastro de doadores e voluntários.

- **Produção:** endereço publicado na etapa de deploy (issue #11)
- **Versão atual:** 3.0.0 — histórico em [CHANGELOG.md](CHANGELOG.md) e nas [releases](https://github.com/claudioometto/ong-ponte-digital/releases)
- **Projeto acadêmico:** Experiências Práticas de Desenvolvimento Front-end (Análise e Desenvolvimento de Sistemas)

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Tecnologias](#tecnologias)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Uso](#uso)
6. [Build de produção](#build-de-produção)
7. [Testes](#testes)
8. [Estrutura de pastas](#estrutura-de-pastas)
9. [Arquitetura](#arquitetura)
10. [Acessibilidade](#acessibilidade)
11. [Como contribuir e manter](#como-contribuir-e-manter)
12. [Observação](#observação)

## Funcionalidades

- **Navegação sem recarregar a página**: rotas por hash (`#/projetos`), título e foco ajustados a cada troca de tela
- **Projetos sociais** gerados a partir de dados: cartões, submenu e gráfico vêm da mesma lista
- **Gráfico de impacto** com Chart.js; sem internet, os mesmos números aparecem em tabela
- **Cadastro de doadores e voluntários** com máscaras (CPF, telefone, CEP), validação de consistência (dígito verificador do CPF, idade, campos condicionais) e mensagens de erro abaixo de cada campo
- **Rascunho automático** do cadastro e histórico dos últimos envios no navegador
- **Componentes de feedback** (alertas, badges, toast, modal) documentados no guia em `#/componentes`
- **Layout responsivo** do celular ao monitor largo, com menu hambúrguer abaixo de 768px

## Tecnologias

| Camada | Tecnologia | Uso |
|---|---|---|
| Estrutura | HTML5 semântico | `header`, `nav`, `main`, `section`, `article`, `figure`, `template`; WAI-ARIA onde o HTML não basta |
| Estilo | CSS3 | Variáveis (design system), Grid de 12 colunas, Flexbox, media queries mobile-first, `prefers-reduced-motion` |
| Comportamento | JavaScript (ES2020, módulos ES) | Roteador, templates, Constraint Validation API, `localStorage`, `fetch`, `CustomEvent` |
| Biblioteca | [Chart.js 4.5.1](https://www.chartjs.org/) | Gráfico de barras, importado do CDN jsDelivr só na tela de projetos |
| Build | [esbuild](https://esbuild.github.io/) e [html-minifier-terser](https://github.com/terser/html-minifier-terser) | Bundle e minificação de JS, CSS e HTML |
| Testes | [Playwright](https://playwright.dev/) e [axe-core](https://github.com/dequelabs/axe-core) | Testes de ponta a ponta e auditoria WCAG 2.1 AA |
| Versionamento | Git e GitHub | GitFlow, Conventional Commits, issues, milestones, pull requests e releases |

O site publicado não tem dependência instalada: Node.js e os pacotes do `package.json` servem só para desenvolver, gerar o build e testar.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (inclui o npm)
- [Git](https://git-scm.com/)
- Navegador atual (Chrome, Edge, Firefox ou Safari)

## Instalação

```bash
git clone https://github.com/claudioometto/ong-ponte-digital.git
cd ong-ponte-digital
npm install                # ferramentas de build e teste
npm run test:instalar      # baixa o Chromium usado nos testes (uma vez só)
```

## Uso

```bash
npm run dev
```

Abra http://localhost:8080. O projeto precisa de um servidor HTTP: módulos ES e o `fetch` das
telas são bloqueados quando o `index.html` é aberto direto do disco (`file://`). O comando acima
usa um servidor em Node sem dependências (`scripts/servidor.mjs`); qualquer outro servidor
estático funciona (extensão Live Server do VS Code, `python -m http.server`).

### Rotas

| Endereço | Tela |
|---|---|
| `#/` | Início |
| `#/projetos` | Projetos sociais |
| `#/projetos/doacao` | Projetos sociais, rolada até `id="doacao"` (vale para qualquer id) |
| `#/cadastro` | Cadastro de doadores e voluntários |
| `#/componentes` | Guia de componentes de feedback |
| qualquer outro | Página não encontrada |

## Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ em http://localhost:4173
```

O `scripts/build.mjs` não altera o código-fonte. Ele junta `js/app.js` e os módulos que ele
importa em um único arquivo minificado (o Chart.js continua vindo do CDN), minifica o CSS e o
HTML da casca e dos fragmentos e copia as imagens. Ao final, imprime o tamanho antes e depois:

| Grupo | Fonte | Build | Redução |
|---|---|---|---|
| JavaScript (15 arquivos → 1) | 50,1 KB | 20,0 KB | 60% |
| CSS | 38,9 KB | 23,4 KB | 40% |
| HTML | 39,3 KB | 30,8 KB | 22% |
| Imagens | 40,1 KB | 40,1 KB | 0% |
| **Total** | **168,3 KB** | **114,2 KB** | **32%** |

É a pasta `dist/` que vai para o servidor de produção.

## Testes

```bash
npm test
```

Gera o build, sobe a prévia e roda a suíte do Playwright contra ela, em desktop e celular (Pixel 7):

| Arquivo | O que confere |
|---|---|
| `tests/navegacao.spec.js` | Cada rota mostra a tela certa, título, `aria-current`, foco no h1, botão voltar, tabela de reserva sem o CDN |
| `tests/teclado.spec.js` | Link de pular, menu do celular com Enter e Esc, submenu do desktop pela seta, foco visível em todo o formulário |
| `tests/foco-leitor.spec.js` | Foco nunca cai no `body` (toast, alerta, rascunho, histórico, envio) e nomes acessíveis sem duplicação nem asterisco |
| `tests/cadastro.spec.js` | Mensagens de erro, CPF com dígito verificador, máscara, rascunho que não guarda o CPF |
| `tests/acessibilidade.spec.js` | axe-core com as regras WCAG 2.1 A e AA nas cinco telas |

Um teste marcado com `test.fail` documenta uma falha conhecida e ligada a uma issue: a suíte segue
verde e, quando a falha for corrigida, o Playwright avisa que o teste passou e a marcação deve sair.

## Estrutura de pastas

```text
ong-ponte-digital/
├── index.html            Casca da SPA: cabeçalho, main#app, rodapé, templates e região de toasts
├── html/                 Telas (fragmentos inseridos em main#app)
│   ├── inicio.html
│   ├── projetos.html
│   ├── cadastro.html
│   ├── componentes.html
│   └── nao-encontrada.html
├── css/style.css         Design system (tokens), grade de 12 colunas e componentes
├── imagens/              Logotipo e ornamento (SVG); fotos (JPG + WebP)
├── js/
│   ├── app.js            Ponto de entrada: importa e liga os módulos
│   ├── roteador.js       Lê o hash, busca o fragmento e o insere em main#app
│   ├── modulos/          Comportamento da tela (DOM e eventos)
│   ├── servicos/         Rede e armazenamento, sem acesso ao DOM
│   ├── templates/        Clonagem e preenchimento dos elementos template
│   └── dados/            Projetos e indicadores
├── scripts/              servidor.mjs (desenvolvimento) e build.mjs (produção)
├── tests/                Testes do Playwright
├── .github/              Modelos de issue e pull request
├── package.json          Comandos npm e ferramentas de desenvolvimento
├── playwright.config.js  Configuração dos testes
├── CHANGELOG.md          Histórico de versões
└── README.md
```

## Arquitetura

### Camadas do JavaScript

`app.js` → `modulos/` → `templates/`, `servicos/`, `dados/`. Nada importa no sentido contrário e
não há dependência circular. Módulos que não se importam conversam por eventos do DOM
(`envio-concluido`, disparado por `cadastro.js` e ouvido por `persistencia.js`).
`servicos/api.js` devolve uma Promise e hoje simula o servidor; com um back-end real, só o miolo
de `enviarCadastro()` vira um `fetch`.

### Templates

A marcação dos componentes repetidos fica em elementos `template` no `index.html` (`tpl-projeto`,
`tpl-indicador`, `tpl-envio`), com `data-campo` nos pontos a preencher, sempre por `textContent`.
Para incluir um projeto, basta acrescentar um objeto em `js/dados/projetos.js`: o cartão, o link do
submenu e a barra do gráfico aparecem sozinhos.

### Dados guardados no navegador

| Chave do `localStorage` | Conteúdo |
|---|---|
| `ponte-digital:rascunho` | Cadastro em andamento. Apagado no envio, no "Limpar formulário" e no "Descartar rascunho" |
| `ponte-digital:envios` | Últimos 5 cadastros enviados neste navegador: data, nome, forma de apoio, projeto e protocolo |

Senha, CPF e aceite da LGPD nunca são gravados.

## Acessibilidade

Meta: WCAG 2.1 nível AA.

- Link "Pular para o conteúdo" como primeiro item do Tab, levando o foco ao `main` (o roteador ignora âncoras que não começam com `#/`)
- Hierarquia de títulos sem saltos, um `h1` por tela, regiões nomeadas (`aria-labelledby`, `aria-label` em cada `nav`)
- Troca de tela anunciada: o roteador leva o foco ao `h1` e atualiza o título da aba
- Foco sempre visível (anel de 3px), menu e submenu operáveis por teclado, Esc fecha e devolve o foco
- Submenu no padrão "disclosure" da WAI: abre pela seta (Enter ou Espaço), então o Tab não passa por links escondidos
- Foco nunca se perde: ao fechar toast ou alerta, descartar o rascunho, apagar o histórico e durante o envio (o botão usa `aria-disabled`, não `disabled`)
- Nomes acessíveis limpos: logotipo com `alt=""` ao lado do nome em texto; asterisco dos rótulos com `aria-hidden` (o `required` já anuncia "obrigatório")
- Formulário: `label` em todo campo, grupos em `fieldset`/`legend`, erros ligados por `aria-describedby` e marcados com `aria-invalid`
- Toasts em região `aria-live`; movimento reduzido respeitado (`prefers-reduced-motion`)
- Verificação: axe-core automático nas cinco telas (`npm test`) e W3C Nu Html Checker sem erros

Falhas abertas ficam na milestone [Etapa 3 · Acessibilidade WCAG 2.1 AA](https://github.com/claudioometto/ong-ponte-digital/milestones).

## Como contribuir e manter

### Branches (GitFlow)

| Branch | Papel |
|---|---|
| `main` | Só versões publicadas, cada uma com tag (`v3.0.0`) |
| `develop` | Integração: recebe as funcionalidades prontas |
| `feature/*`, `docs/*`, `chore/*` | Uma tarefa cada, criada a partir de `develop` |
| `release/x.y.z` | Preparação de uma versão: só ajustes finais |
| `hotfix/*` | Correção urgente: sai da `main` e volta para `main` e `develop` |

### Fluxo de uma tarefa

1. Abrir (ou pegar) uma issue, com milestone e etiqueta
2. `git switch -c feature/nome-curto develop`
3. Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, com escopo opcional (`feat(cadastro): ...`)
4. `npm test` sem falhas
5. Pull request para `develop`, preenchendo o modelo e citando `Resolve #n`
6. Revisão e merge por merge commit (squash e rebase estão desativados no repositório)

### Lançar uma versão

O projeto segue o [versionamento semântico](https://semver.org/lang/pt-BR/): MAIOR quando quebra
endereços ou estrutura, MENOR para recurso novo compatível, CORREÇÃO para falhas.

1. `git switch -c release/x.y.z develop`
2. Atualizar `version` no `package.json` e mover as entradas de "Não lançado" no `CHANGELOG.md`
3. Merge na `main`, tag anotada `vx.y.z` e merge de volta na `develop`
4. Publicar a release no GitHub com as notas do CHANGELOG

## Observação

Organização, endereço, CNPJ, números de impacto e imagens são fictícios, criados para fins acadêmicos.
