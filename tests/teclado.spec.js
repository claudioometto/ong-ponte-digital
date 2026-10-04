// Navegação por teclado no menu e foco visível (WCAG 2.1.1 e 2.4.7).
import { test, expect } from '@playwright/test';

test('menu do celular abre com Enter e fecha com Esc, devolvendo o foco', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'O botão Menu só existe abaixo de 768px');
  await page.goto('/#/');
  const botao = page.locator('.menu-botao');
  await botao.focus();
  await page.keyboard.press('Enter');
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#menu-principal a[href="#/cadastro"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await expect(botao).toBeFocused();
});

test('no desktop, o submenu abre quando o foco do Tab entra nele', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Comportamento do desktop');
  await page.goto('/#/');
  await page.locator('#menu-principal a[href="#/projetos"]').focus();
  await expect(page.locator('.submenu-botao')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#submenu-projetos a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.submenu-botao')).toHaveAttribute('aria-expanded', 'false');
});

test('todo elemento que recebe foco pelo Tab no cadastro mostra o contorno de foco', async ({ page }) => {
  // Falha conhecida: ícone do calendário dos campos date (issue #13).
  // Quando for corrigida, o Playwright acusa "passou inesperadamente" e esta linha sai.
  test.fail(true, 'Issue #13: campo de data perde o anel de foco no ícone do calendário');
  await page.goto('/#/cadastro');
  await expect(page.locator('#app h1')).toBeVisible();
  // Percorre do topo até o botão de envio
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement.matches('#form-apoio [type="submit"]'))) break;
    const foco = await page.evaluate(() => {
      const el = document.activeElement;
      const estilo = getComputedStyle(el);
      return {
        alvo: el.tagName + (el.id ? '#' + el.id : ''),
        largura: parseFloat(estilo.outlineWidth),
        tipo: estilo.outlineStyle,
        sombra: estilo.boxShadow
      };
    });
    const visivel = (foco.tipo !== 'none' && foco.largura > 0) || foco.sombra !== 'none';
    expect(visivel, `foco sem contorno em ${foco.alvo}`).toBe(true);
  }
});
