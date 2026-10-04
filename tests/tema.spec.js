// Temas: seletor, preferência do sistema, persistência e cores-chave.
import { test, expect } from '@playwright/test';

/* Razão de contraste da WCAG entre duas cores rgb() calculadas pelo navegador */
function contraste(a, b) {
  const lum = (cor) => {
    const [r, g, bl] = cor.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [claro, escuro] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

async function abrirMenuSeCelular(page, isMobile) {
  if (isMobile) await page.locator('.menu-botao').click();
}

test('sem escolha salva, segue o modo escuro do sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/#/');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
});

test('sem escolha salva, a preferência de mais contraste do sistema vence', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', contrast: 'more' });
  await page.goto('/#/');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'alto-contraste');
});

test('o seletor "Tema" troca o tema na hora e a escolha sobrevive ao recarregar', async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/#/');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  await abrirMenuSeCelular(page, isMobile);
  const seletor = page.getByRole('combobox', { name: 'Tema' });
  await expect(seletor).toHaveValue('auto');
  await seletor.selectOption('alto-contraste');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'alto-contraste');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'alto-contraste');
  await abrirMenuSeCelular(page, isMobile);
  await expect(page.getByRole('combobox', { name: 'Tema' })).toHaveValue('alto-contraste');
  // Voltar para "Automático" apaga a escolha e devolve ao sistema
  await page.getByRole('combobox', { name: 'Tema' }).selectOption('auto');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  expect(await page.evaluate(() => localStorage.getItem('ponte-digital:tema'))).toBeNull();
});

test('em "Automático", acompanha a troca feita no sistema com a página aberta', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/#/');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
});

for (const [tema, minimo] of [['claro', 4.5], ['escuro', 4.5], ['alto-contraste', 7]]) {
  test(`tema ${tema}: texto, link e botão de ação com contraste mínimo de ${minimo}:1`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('ponte-digital:tema', JSON.stringify(t)), tema);
    await page.goto('/#/');
    await expect(page.locator('#app h1')).toBeVisible();
    const cores = await page.evaluate(() => {
      const css = (seletor) => getComputedStyle(document.querySelector(seletor));
      return {
        fundo: css('body').backgroundColor,
        texto: css('#app p').color,
        link: css('.site-footer address a').color,
        botao: css('#app .btn').backgroundColor,
        textoBotao: css('#app .btn').color
      };
    });
    expect(contraste(cores.texto, cores.fundo)).toBeGreaterThanOrEqual(minimo);
    expect(contraste(cores.link, cores.fundo)).toBeGreaterThanOrEqual(minimo);
    expect(contraste(cores.textoBotao, cores.botao)).toBeGreaterThanOrEqual(minimo);
  });
}

test('modo de cores forçadas do Windows: o ícone do menu continua visível', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'O botão Menu só existe abaixo de 768px');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/#/');
  const barra = await page.locator('.menu-icone').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(barra).not.toBe('rgba(0, 0, 0, 0)');
});
