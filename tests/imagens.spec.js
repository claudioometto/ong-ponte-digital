// Imagens otimizadas: formato moderno escolhido, carregamento preguiçoso e nenhuma imagem quebrada.
import { test, expect } from '@playwright/test';

test('o navegador baixa a foto do topo em AVIF, não em JPEG', async ({ page }) => {
  const pedidas = [];
  page.on('request', (req) => { if (req.url().includes('/imagens/')) pedidas.push(req.url()); });
  await page.goto('/#/');
  await expect(page.locator('.hero-img')).toBeVisible();
  await expect.poll(() => page.locator('.hero-img').evaluate((img) => img.currentSrc)).toMatch(/hero-turma-\d+\.avif$/);
  expect(pedidas.filter((u) => /hero-turma.*\.jpg$/.test(u))).toEqual([]);
});

test('em tela estreita de densidade 1, a foto do topo vem na largura de 480px', async ({ browser }) => {
  // Celulares de alta densidade (ex.: 2,6x) podem pedir a de 960 para nitidez: é o srcset funcionando
  const contexto = await browser.newContext({ viewport: { width: 400, height: 800 }, deviceScaleFactor: 1 });
  const page = await contexto.newPage();
  await page.goto('http://localhost:4173/#/');
  await expect.poll(() => page.locator('.hero-img').evaluate((img) => img.currentSrc)).toMatch(/hero-turma-480\.avif$/);
  await contexto.close();
});

test('fotos abaixo da dobra usam loading="lazy" e a do topo, fetchpriority="high"', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('.hero-img')).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('figure img')).toHaveAttribute('loading', 'lazy');
  await page.goto('/#/projetos');
  const cartoes = page.locator('#app .projeto img');
  await expect(cartoes).toHaveCount(3);
  for (const img of await cartoes.all()) await expect(img).toHaveAttribute('loading', 'lazy');
});

for (const rota of ['#/', '#/projetos']) {
  test(`${rota}: todas as imagens carregam (nenhuma quebrada)`, async ({ page }) => {
    await page.goto('/' + rota);
    await expect(page.locator('#app h1')).toBeVisible();
    // Rola até o fim para disparar as imagens com loading="lazy"
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const imagens = page.locator('img');
    for (const img of await imagens.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });
}
