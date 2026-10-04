// Foco nunca se perde (WCAG 2.4.3) e nomes acessíveis corretos (4.1.2),
// conferidos na árvore de acessibilidade que o leitor de tela recebe.
import { test, expect } from '@playwright/test';

const focoNoBody = (page) => page.evaluate(() => document.activeElement === document.body);

test('o link do logotipo tem o nome uma vez só', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('link', { name: 'Instituto Ponte Digital', exact: true })).toBeVisible();
});

test('rótulos dos campos obrigatórios são lidos sem o asterisco', async ({ page }) => {
  await page.goto('/#/cadastro');
  const nome = page.getByRole('textbox', { name: 'Nome completo', exact: true });
  await expect(nome).toBeVisible();
  await expect(nome).toHaveAttribute('required', '');
  await expect(page.getByRole('checkbox', { name: /^Autorizo o uso dos meus dados/ })).toHaveAccessibleName(/recibo$/);
});

test('fechar um toast pelo teclado devolve o foco ao botão que o abriu', async ({ page }) => {
  await page.goto('/#/componentes');
  const gatilho = page.locator('[data-toast]').first();
  await gatilho.focus();
  await page.keyboard.press('Enter');
  await page.locator('.toasts .botao-fechar').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.toasts .toast')).toHaveCount(0);
  await expect(gatilho).toBeFocused();
});

test('fechar um alerta pelo teclado leva o foco ao título da seção', async ({ page }) => {
  await page.goto('/#/componentes');
  const fechar = page.locator('.alerta--fechavel .botao-fechar').first();
  const titulo = page.locator('section:has(.alerta--fechavel)').locator('h1, h2, h3').first();
  await fechar.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.alerta--fechavel').first()).toBeHidden();
  await expect(titulo).toBeFocused();
});

test('descartar o rascunho leva o foco ao primeiro campo', async ({ page }) => {
  await page.goto('/#/cadastro');
  await page.locator('#nome').pressSequentially('Ana Souza');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ponte-digital:rascunho')))
    .toContain('Ana');
  await page.reload();
  await page.locator('#descartar-rascunho').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#aviso-rascunho')).toBeHidden();
  await expect(page.locator('#nome')).toBeFocused();
  await expect(page.locator('#nome')).toHaveValue('');
});

test('apagar o histórico leva o foco ao título da coluna e avisa por toast', async ({ page }) => {
  await page.goto('/#/cadastro');
  await page.evaluate(() => localStorage.setItem('ponte-digital:envios',
    JSON.stringify([{ data: new Date().toISOString(), nome: 'Ana Souza', apoio: 'doador', projeto: '', protocolo: 'PD-1' }])));
  await page.reload();
  await page.locator('#apagar-envios').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#meus-envios')).toBeHidden();
  await expect(page.locator('#duvidas')).toBeFocused();
  await expect(page.locator('.toasts')).toContainText('Histórico apagado');
});

test('durante e depois do envio, o foco fica no botão', async ({ page }) => {
  await page.goto('/#/cadastro');
  await page.locator('#form-apoio').waitFor();
  // Só o comportamento do envio interessa aqui: as regras de validação têm testes próprios
  await page.evaluate(() => {
    document.querySelectorAll('#form-apoio [required]').forEach((c) => { c.required = false; });
    document.querySelectorAll('#form-apoio [pattern], #form-apoio [min]').forEach((c) => { c.removeAttribute('pattern'); c.removeAttribute('min'); });
  });
  const botao = page.locator('#form-apoio button[type="submit"]');
  await botao.focus();
  await page.keyboard.press('Enter');
  await expect(botao).toHaveAttribute('aria-disabled', 'true');
  await expect(botao).toHaveText('Enviando…');
  expect(await focoNoBody(page)).toBe(false);
  await expect(botao).toBeFocused();
  // Enter repetido durante o envio não gera segundo envio
  await page.keyboard.press('Enter');
  await expect(page.locator('.toasts')).toContainText('Cadastro enviado');
  await expect(page.locator('.toasts .toast')).toHaveCount(1);
  await expect(botao).not.toHaveAttribute('aria-disabled');
  await expect(botao).toBeFocused();
});
