# Histórico de versões

Todas as mudanças relevantes do projeto. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versões no padrão [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado] — previsto como 3.1.0

### Adicionado
- Build de produção (`npm run build`): JavaScript em um único arquivo, CSS e HTML minificados; 32% menor no total
- Servidor local sem dependências (`npm run dev` e `npm run preview`)
- Testes de ponta a ponta e auditoria WCAG 2.1 AA com Playwright e axe-core (`npm test`)
- README com instalação, uso, build, testes, arquitetura e fluxo de manutenção
- Modelos de issue e pull request; `.gitignore`
- Link "Pular para o conteúdo" (WCAG 2.4.1)

### Corrigido
- Âncora comum (`#app`) era tratada como rota e mostrava "Página não encontrada"
- Campo de data perdia o anel de foco no ícone do calendário (#13)
- Foco caía no `body` ao fechar toast ou alerta, descartar o rascunho, apagar o histórico e durante o envio do cadastro
- Link do logotipo era lido com o nome duplicado; rótulos obrigatórios eram lidos com "asterisco"

### Alterado
- Submenu do desktop abre pela seta (Enter ou Espaço), não mais quando o foco chega ao link

## [3.0.0] — 2026-10-04 · JavaScript e SPA

### Alterado (incompatível)
- O site virou SPA: endereços passam a ser rotas por hash (`#/projetos`) e exigem servidor local
- Pastas reorganizadas em `html/`, `css/`, `imagens/` e `js/`; os caminhos `assets/` e `projetos.html` deixam de existir

### Adicionado
- Roteador por hash com carregamento de fragmentos, título e foco por tela
- Cartões, indicadores e submenu gerados por templates a partir de `js/dados/`
- Validação de consistência: dígito verificador do CPF, nome completo, idade, campos condicionais
- Rascunho e histórico de envios no `localStorage`
- Gráfico de impacto com Chart.js e tabela de reserva
- Camada de serviços (`api.js`, `armazenamento.js`) separada da interface

## [2.0.0] — 2026-09-19 · CSS3 e design system

### Alterado (incompatível)
- Marcação das três páginas reescrita: novo cabeçalho com menu e classes de layout

### Adicionado
- Design system com tokens em `:root`, grade de 12 colunas e 5 breakpoints mobile-first
- Menu hambúrguer e submenu controlados por `aria-expanded`
- Alertas, badges, toast e modal; guia de componentes

## [1.0.0] — 2026-09-12 · HTML5 semântico

### Adicionado
- Página inicial, página de projetos sociais e formulário de cadastro em HTML5 semântico
- Validação nativa do formulário e máscaras de CPF, telefone e CEP
- Imagens responsivas com `picture` (WebP + JPG)

[Não lançado]: https://github.com/claudioometto/ong-ponte-digital/compare/v3.0.0...develop
[3.0.0]: https://github.com/claudioometto/ong-ponte-digital/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/claudioometto/ong-ponte-digital/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/claudioometto/ong-ponte-digital/releases/tag/v1.0.0
