// Auditoria automática com axe-core contra as regras WCAG 2.0 e 2.1, níveis A e AA,
// nas cinco telas e nos três temas. Pega o que é verificável por máquina
// (contraste real das cores renderizadas, nomes, ARIA, estrutura);
// o restante é conferido à mão com teclado e leitor de tela.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROTAS = ['#/', '#/projetos', '#/cadastro', '#/componentes', '#/nao-existe'];
const TEMAS = ['claro', 'escuro', 'alto-contraste'];

for (const tema of TEMAS) {
  for (const rota of ROTAS) {
    test(`${rota} no tema ${tema}: sem violações WCAG 2.1 AA detectáveis pelo axe`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('ponte-digital:tema', JSON.stringify(t)), tema);
      await page.goto('/' + rota);
      await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
      await expect(page.locator('#app h1')).toBeVisible();
      await expect(page.locator('#app')).not.toHaveAttribute('aria-busy', 'true');
      const resultado = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const resumo = resultado.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.length} elemento(s), ${v.help} — ${v.nodes[0].target}`
      );
      expect(resumo, resumo.join('\n')).toEqual([]);
    });
  }
}
