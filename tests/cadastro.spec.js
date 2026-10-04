// Formulário: mensagens de erro, regra do CPF, máscara e rascunho.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/cadastro');
  await expect(page.locator('#form-apoio')).toBeVisible();
});

test('enviar vazio marca os campos e escreve a mensagem abaixo deles', async ({ page }) => {
  await page.locator('#form-apoio button[type="submit"]').click();
  const nome = page.locator('#nome');
  await expect(nome).toHaveAttribute('aria-invalid', 'true');
  await expect(nome).toHaveAttribute('aria-describedby', /\S/);
  await expect(page.locator('#form-apoio .mensagem-erro:visible').first()).toContainText(/Preencha|Informe/);
});

test('CPF com dígito verificador errado é recusado', async ({ page }) => {
  await page.locator('#cpf').pressSequentially('11144477700');
  await page.locator('#form-apoio button[type="submit"]').click();
  await expect(page.locator('#cpf')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#form-apoio')).toContainText('Este CPF não existe');
});

test('CPF válido recebe a máscara e passa na regra', async ({ page }) => {
  await page.locator('#cpf').pressSequentially('52998224725');
  await expect(page.locator('#cpf')).toHaveValue('529.982.247-25');
  expect(await page.locator('#cpf').evaluate((campo) => campo.checkValidity())).toBe(true);
});

test('o rascunho sobrevive a um recarregamento e não guarda o CPF', async ({ page }) => {
  await page.locator('#nome').pressSequentially('Ana Souza');
  await page.locator('#cpf').pressSequentially('52998224725');
  await page.locator('#email').click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ponte-digital:rascunho')))
    .toContain('Ana Souza');
  await page.reload();
  await expect(page.locator('#nome')).toHaveValue('Ana Souza');
  await expect(page.locator('#cpf')).toHaveValue('');
  const rascunho = await page.evaluate(() => localStorage.getItem('ponte-digital:rascunho'));
  expect(rascunho).not.toContain('52998224725');
  expect(rascunho).not.toContain('529.982');
});
