import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// URLs de exemplo para cada forma de rota do routes.manifest.yaml.
const urls = [
  '/',
  '/departamento-exemplo',
  '/departamento-exemplo/categoria-exemplo',
  '/departamento-exemplo/categoria-exemplo/sub-exemplo',
  '/b/palavra-chave-exemplo',
  '/produto-exemplo/p',
  '/s',
  '/mapa-do-site',
];

for (const url of urls) {
  test(`${url}: 200, um unico H1 e main no HTML inicial`, async ({ page }) => {
    const res = await page.goto(url);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
}

test('home: 0 violacoes axe', async ({ page, javaScriptEnabled }) => {
  // O axe-core e JavaScript injetado na pagina: sem JS ele nao roda (o
  // projeto `nojs` so valida que o conteudo existe no HTML inicial).
  test.skip(!javaScriptEnabled, 'axe precisa de JavaScript');
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('headers de seguranca vem do manifest', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-powered-by']).toBeUndefined();
});
