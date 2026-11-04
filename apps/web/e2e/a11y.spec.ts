import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// So no projeto "chromium" (axe precisa injetar e rodar JS na pagina).
// CLAUDE.md > Acessibilidade: "0 violacoes do axe em todas as stories e em
// todos os E2E".
test('home sem violacoes de acessibilidade (axe)', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
