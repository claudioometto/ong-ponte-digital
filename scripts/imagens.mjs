/*
  Otimização das fotos: gera, a partir dos originais, as versões servidas no site.
  Uso: npm run imagens (rodar sempre que um original for incluído ou trocado)

  - Originais em imagens/originais/ (nunca vão para o build): partir sempre
    deles evita recomprimir uma imagem já comprimida a cada execução.
  - Cada foto sai em três formatos, do mais leve ao mais compatível:
    AVIF -> WebP -> JPEG (mozjpeg, progressivo). O <picture> deixa o
    navegador escolher o primeiro que entende.
  - Fotos grandes saem em duas larguras, para o celular baixar a menor (srcset).
*/
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const ORIGINAIS = 'imagens/originais';
const SAIDA = 'imagens';

/* Larguras geradas por foto (px). Nunca amplia: larguras maiores que o original são ignoradas. */
const LARGURAS = {
  'hero-turma': [480, 960],
  equipe: [320, 640],
  padrao: [480]
};

/* Qualidades calibradas a olho: sem perda visível nas fotos do site */
const FORMATOS = {
  avif: (img) => img.avif({ quality: 50, effort: 6 }),
  webp: (img) => img.webp({ quality: 75, effort: 6 }),
  jpg: (img) => img.jpeg({ quality: 75, mozjpeg: true, progressive: true })
};

const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' KB';

let totalOriginal = 0;
const totalPorFormato = { avif: 0, webp: 0, jpg: 0 };

console.log('\nFoto            Largura  Original     AVIF     WebP     JPEG');
for (const arquivo of (await readdir(ORIGINAIS)).sort()) {
  const { name: nome } = parse(arquivo);
  const caminho = join(ORIGINAIS, arquivo);
  const original = await stat(caminho);
  const { width } = await sharp(caminho).metadata();
  totalOriginal += original.size;

  for (const largura of (LARGURAS[nome] || LARGURAS.padrao).filter((l) => l <= width)) {
    const tamanhos = {};
    for (const [formato, codificar] of Object.entries(FORMATOS)) {
      const destino = join(SAIDA, `${nome}-${largura}.${formato}`);
      const info = await codificar(sharp(caminho).resize({ width: largura })).toFile(destino);
      tamanhos[formato] = info.size;
    }
    /* Para o total, conta só a largura maior de cada foto, comparável ao original */
    if (largura === Math.max(...(LARGURAS[nome] || LARGURAS.padrao).filter((l) => l <= width))) {
      for (const f of Object.keys(tamanhos)) totalPorFormato[f] += tamanhos[f];
    }
    console.log(`${nome.padEnd(15)} ${String(largura).padStart(5)}px ${kb(original.size)} ${kb(tamanhos.avif)} ${kb(tamanhos.webp)} ${kb(tamanhos.jpg)}`);
  }
}

const reducao = (n) => (100 - (n / totalOriginal) * 100).toFixed(0) + '%';
console.log(`\nTotal na largura maior: original ${kb(totalOriginal)}`);
console.log(`  AVIF ${kb(totalPorFormato.avif)} (${reducao(totalPorFormato.avif)} menor)`);
console.log(`  WebP ${kb(totalPorFormato.webp)} (${reducao(totalPorFormato.webp)} menor)`);
console.log(`  JPEG ${kb(totalPorFormato.jpg)} (${reducao(totalPorFormato.jpg)} menor)\n`);
