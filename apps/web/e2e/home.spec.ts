import { test, expect } from '@playwright/test';

// Roda nos projetos "chromium" e "nojs" (playwright.config.ts). Prova desde
// a Fase 0 a regra do CLAUDE.md > SEO e GEO: "todo conteudo indexavel existe
// no HTML inicial".
test('home renderiza o H1 principal mesmo sem JavaScript', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
