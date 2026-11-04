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

for (const url of ['/', '/s', '/s?q=camiseta', '/a/b/c/d/e']) {
  test(`${url}: 0 violacoes axe`, async ({ page, javaScriptEnabled }) => {
    // O axe-core e JavaScript injetado na pagina: sem JS ele nao roda (o
    // projeto `nojs` so valida que o conteudo existe no HTML inicial).
    test.skip(!javaScriptEnabled, 'axe precisa de JavaScript');
    await page.goto(url);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test.describe('busca (/s)', () => {
  test('sem termo: formulario e estado vazio no HTML inicial', async ({ page }) => {
    await page.goto('/s');
    await expect(page.getByRole('heading', { level: 1, name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('search')).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByRole('status')).toContainText('Digite um termo para começar a buscar.');
  });

  test('com termo: sem resultados, dica e termo preservado no campo', async ({ page }) => {
    await page.goto('/s?q=camiseta');
    await expect(page.getByRole('status')).toContainText('Nenhum resultado para «camiseta»');
    await expect(page.getByRole('status')).toContainText('Confira a ortografia');
    await expect(page.getByRole('searchbox')).toHaveValue('camiseta');
  });

  test('termo so com espacos conta como busca vazia', async ({ page }) => {
    await page.goto('/s?q=%20%20%20');
    await expect(page.getByRole('status')).toContainText('Digite um termo');
  });

  test('envio do formulario funciona (GET nativo, vale sem JS)', async ({ page }) => {
    await page.goto('/s');
    await page.getByRole('searchbox').fill('tenis');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page).toHaveURL(/\/s\?q=tenis$/);
    await expect(page.getByRole('status')).toContainText('Nenhum resultado para «tenis»');
  });

  test('e noindex,nofollow', async ({ page }) => {
    await page.goto('/s?q=camiseta');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test('rota inexistente: status 404 real e not-found.tsx', async ({ page }) => {
  const res = await page.goto('/a/b/c/d/e');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
});

test('headers de seguranca vem do manifest', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-powered-by']).toBeUndefined();
});
