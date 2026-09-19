# Instituto Ponte Digital — plataforma web

Projeto desenvolvido para a Experiência Prática I da disciplina de Desenvolvimento Front-end
(Análise e Desenvolvimento de Sistemas). Simula o site de uma organização do terceiro setor
que forma jovens de periferia em tecnologia.

## Estrutura

```
ong-ponte-digital/
├── index.html          Página institucional (apresentação, impacto, contato)
├── projetos.html       Projetos sociais, campanhas de doação e voluntariado
├── cadastro.html       Formulário de doadores e voluntários
├── componentes.html    Guia de componentes de feedback (para quem integrar o back-end)
├── README.md           Este arquivo
└── assets/
    ├── css/style.css   Estilos do projeto
    ├── img/            Logotipo (SVG) e fotos (JPG + WebP)
    └── js/
        ├── mascaras.js Máscaras de CPF, telefone e CEP
        ├── menu.js     Menu hambúrguer e submenu (só alterna aria-expanded)
        └── feedback.js Toast, modal e resumo de erros (API: PonteFeedback.toast / abrirModal)
```

## Padrões adotados

- **HTML5 semântico**: `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`, `address`.
- **Hierarquia de títulos**: um `h1` por página, sem pular níveis.
- **Acessibilidade**: `lang="pt-BR"`, `alt` em toda imagem (vazio nas decorativas), `aria-labelledby` nas seções, `aria-label` em cada `nav`, `label` vinculado a todo campo por `for`/`id`, foco visível.
- **Imagens**: `<picture>` com WebP e fallback JPG; `width` e `height` declarados para evitar salto de layout.
- **Formulário**: validação nativa (`required`, `type`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`). O JavaScript apenas formata a digitação — sem ele, o formulário continua validando.

## Conformidade

Os três arquivos HTML foram submetidos ao W3C Nu Html Checker (validator.w3.org/nu):
**0 erros e 0 avisos** em `index.html`, `projetos.html` e `cadastro.html`.

## Como executar

Abra `index.html` em qualquer navegador. Não há dependências nem etapa de build.

## Observação

Organização, endereço, CNPJ, números de impacto e imagens são fictícios, criados para fins acadêmicos.
