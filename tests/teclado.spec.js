// Navegação por teclado no menu e foco visível (WCAG 2.1.1, 2.4.1 e 2.4.7).
import { test, expect } from '@playwright/test';

test('o primeiro Tab mostra "Pular para o conteúdo" e o Enter leva o foco ao main', async ({ page }) => {
  await page.goto('/#/projetos');
  await expect(page.locator('#app h1')).toHaveText('Projetos sociais');
  await page.locator('body').focus();
  await page.keyboard.press('Tab');
  const pular = page.locator('.pular-conteudo');
  await expect(pular).toBeFocused();
  await expect(pular).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#app')).toBeFocused();
  // Âncora comum não é rota: a tela continua a mesma
  await expect(page.locator('#app h1')).toHaveText('Projetos sociais');
  // O próximo Tab segue dentro do conteúdo, não volta ao menu
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.getElementById('app').contains(document.activeElement))).toBe(true);
});

test('endereço aberto já com #app carrega a tela inicial, não a página de erro', async ({ page }) => {
  await page.goto('/#app');
  await expect(page.locator('#app h1')).toHaveText(/primeiro emprego/);
});

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
  // Inclui o ícone do calendário dos campos date (falha da issue #13, corrigida)
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
