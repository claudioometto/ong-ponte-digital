/*
  Build de produção: gera dist/ sem alterar o código-fonte.
  - JS: app.js e tudo que ele importa viram um único arquivo minificado (esbuild).
        O Chart.js continua vindo do CDN por import() dinâmico, fora do pacote.
  - CSS: style.css minificado (esbuild).
  - HTML: casca e fragmentos sem comentários e espaços redundantes (html-minifier-terser).
  - Imagens: fotos já otimizadas por scripts/imagens.mjs são copiadas (os originais
    ficam de fora); SVGs passam pelo svgo.
  Ao final, imprime o tamanho de cada grupo antes e depois.
*/
import { build } from 'esbuild';
import { minify } from 'html-minifier-terser';
import { optimize } from 'svgo';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SAIDA = 'dist';

async function tamanho(caminho) {
  const info = await stat(caminho);
  if (!info.isDirectory()) return info.size;
  let total = 0;
  for (const item of await readdir(caminho)) total += await tamanho(join(caminho, item));
  return total;
}

async function somar(caminhos) {
  let total = 0;
  for (const c of caminhos) total += await tamanho(c);
  return total;
}

const OPCOES_HTML = {
  collapseWhitespace: true,
  conservativeCollapse: true, // mantém um espaço onde havia espaço: não cola palavras
  removeComments: true,
  minifyCSS: true,
  minifyJS: true
};

await rm(SAIDA, { recursive: true, force: true });
await mkdir(join(SAIDA, 'html'), { recursive: true });

// JavaScript
await build({
  entryPoints: ['js/app.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'none',
  outfile: join(SAIDA, 'js/app.js')
});

// CSS
await build({
  entryPoints: ['css/style.css'],
  minify: true,
  outfile: join(SAIDA, 'css/style.css')
});

// HTML: casca + fragmentos
const fragmentos = (await readdir('html')).filter((f) => f.endsWith('.html')).map((f) => join('html', f));
for (const arquivo of ['index.html', ...fragmentos]) {
  const original = await readFile(arquivo, 'utf8');
  await writeFile(join(SAIDA, arquivo), await minify(original, OPCOES_HTML));
}

// Imagens: tudo menos imagens/originais/; SVGs otimizados (metadados e casas decimais)
await cp('imagens', join(SAIDA, 'imagens'), {
  recursive: true,
  filter: (origem) => !relative('imagens', origem).startsWith('originais')
});
for (const arquivo of (await readdir(join(SAIDA, 'imagens'))).filter((f) => f.endsWith('.svg'))) {
  const caminho = join(SAIDA, 'imagens', arquivo);
  await writeFile(caminho, optimize(await readFile(caminho, 'utf8'), { multipass: true }).data);
}

// Relatório
const arquivosJs = [];
for (const pasta of ['js', 'js/dados', 'js/modulos', 'js/servicos', 'js/templates']) {
  for (const f of await readdir(pasta)) if (f.endsWith('.js')) arquivosJs.push(join(pasta, f));
}
const svgs = (await readdir('imagens')).filter((f) => f.endsWith('.svg')).map((f) => join('imagens', f));
const grupos = [
  ['JavaScript', arquivosJs, [join(SAIDA, 'js/app.js')]],
  ['CSS', ['css/style.css'], [join(SAIDA, 'css/style.css')]],
  ['HTML', ['index.html', ...fragmentos], ['index.html', ...fragmentos].map((f) => join(SAIDA, f))],
  ['SVG', svgs, svgs.map((f) => join(SAIDA, f))]
];

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' KB';
console.log('\nBuild gerado em dist/\n');
console.log('Grupo        Fonte       Build     Redução');
let antes = 0, depois = 0;
for (const [nome, fonte, saida] of grupos) {
  const a = await somar(fonte), d = await somar(saida);
  antes += a; depois += d;
  console.log(`${nome.padEnd(10)} ${kb(a)} ${kb(d)}   ${(100 - (d / a) * 100).toFixed(0).padStart(3)}%`);
}
console.log(`${'Total'.padEnd(10)} ${kb(antes)} ${kb(depois)}   ${(100 - (depois / antes) * 100).toFixed(0).padStart(3)}%`);
console.log(`Requisições de JavaScript: ${arquivosJs.length} → 1\n`);
