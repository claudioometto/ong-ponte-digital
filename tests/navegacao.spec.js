// Rotas da SPA: cada endereço mostra a tela certa, com título e link atual marcados.
import { test, expect } from '@playwright/test';

const TELAS = [
  { hash: '#/', h1: /primeiro emprego/, titulo: /Educação em tecnologia/ },
  { hash: '#/projetos', h1: 'Projetos sociais', titulo: /^Projetos sociais/ },
  { hash: '#/cadastro', h1: 'Cadastro de doadores e voluntários', titulo: /^Seja apoiador/ },
  { hash: '#/componentes', h1: 'Guia de componentes de feedback', titulo: /^Guia de componentes/ },
  { hash: '#/rota-que-nao-existe', h1: 'Página não encontrada', titulo: /^Página não encontrada/ }
];

for (const tela of TELAS) {
  test(`${tela.hash} mostra a tela certa`, async ({ page }) => {
    await page.goto('/' + tela.hash);
    await expect(page.locator('#app h1')).toHaveText(tela.h1);
    await expect(page.locator('#app h1')).toHaveCount(1);
    await expect(page).toHaveTitle(tela.titulo);
  });
}

test('o link da tela atual recebe aria-current="page"', async ({ page }) => {
  await page.goto('/#/projetos');
  await expect(page.locator('#app h1')).toHaveText('Projetos sociais');
  await expect(page.locator('.site-footer a[aria-current="page"]')).toHaveText('Projetos sociais');
});

test('a troca de tela leva o foco ao título, para o leitor de tela anunciar', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('#app h1')).toBeVisible();
  await page.locator('.site-footer a[href="#/cadastro"]').click();
  await expect(page.locator('#app h1')).toBeFocused();
});

test('o botão voltar do navegador volta para a tela anterior', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('#app h1')).toBeVisible();
  await page.goto('/#/projetos');
  await expect(page.locator('#app h1')).toHaveText('Projetos sociais');
  await page.goBack();
  await expect(page.locator('#app h1')).toHaveText(/primeiro emprego/);
});

test('sem o CDN do Chart.js, os números aparecem em tabela', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/**', (rota) => rota.abort());
  await page.goto('/#/projetos');
  await expect(page.locator('#app h1')).toHaveText('Projetos sociais');
  const secao = page.locator('#app section:has(#grafico-formados)');
  await expect(secao).toHaveClass(/grafico--indisponivel/);
  await expect(secao.locator('details')).toHaveAttribute('open', '');
  await expect(secao.locator('table')).toBeVisible();
  await expect(secao.locator('tbody tr').first()).toBeVisible();
});
