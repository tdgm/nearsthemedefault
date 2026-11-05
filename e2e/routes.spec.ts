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

for (const url of ['/', '/departamento-exemplo', '/produto-exemplo/p', '/s', '/s?q=camiseta', '/a/b/c/d/e']) {
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
  // O termo (searchParams) e dado de requisicao: com cacheComponents o Next
  // envia o shell estatico e faz stream do resto dentro de <div hidden>, que o
  // React so revela com JavaScript. /s e noindex, entao a regra "conteudo
  // indexavel sem JS" (CLAUDE.md) nao se aplica; so metadados valem no `nojs`.
  // Limitacao registrada em docs/adr/0009-fase-0-fundacao.md.
  const needsJs = 'resultado da busca e transmitido por stream e so aparece com JavaScript';

  test('sem termo: formulario e estado vazio no HTML inicial', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, needsJs);
    await page.goto('/s');
    await expect(page.getByRole('heading', { level: 1, name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('search')).toBeVisible();
    await expect(page.getByRole('main').getByRole('searchbox')).toHaveValue('');
    await expect(page.getByRole('status')).toContainText('Digite um termo para começar a buscar.');
  });

  test('com termo: sem resultados, dica e termo preservado no campo', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, needsJs);
    await page.goto('/s?q=camiseta');
    await expect(page.getByRole('status')).toContainText('Nenhum resultado para «camiseta»');
    await expect(page.getByRole('status')).toContainText('Confira a ortografia');
    await expect(page.getByRole('main').getByRole('searchbox')).toHaveValue('camiseta');
  });

  test('termo so com espacos conta como busca vazia', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, needsJs);
    await page.goto('/s?q=%20%20%20');
    await expect(page.getByRole('status')).toContainText('Digite um termo');
  });

  test('envio do formulario (GET nativo) leva ao estado sem resultados', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, needsJs);
    await page.goto('/s');
    await page.getByRole('main').getByRole('searchbox').fill('tenis');
    await page.getByRole('main').getByRole('button', { name: 'Buscar' }).click();
    await expect(page).toHaveURL(/\/s\?q=tenis$/);
    await expect(page.getByRole('status')).toContainText('Nenhum resultado para «tenis»');
  });

  test('e noindex,nofollow', async ({ page }) => {
    await page.goto('/s?q=camiseta');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('PDP (/produto-exemplo/p)', () => {
  // Frete e transmitido por stream (le a URL), como a busca: so aparece com JS.
  const needsJs = 'cotacao de frete e transmitida por stream e so aparece com JavaScript';

  test('conteudo indexavel no HTML inicial: nome, preco, detalhes, avaliacoes e FAQ', async ({ page }) => {
    await page.goto('/produto-exemplo/p');
    await expect(page.getByRole('heading', { level: 1, name: 'Produto 1' })).toBeVisible();
    await expect(page.getByRole('main').getByText('R$ 59,90').first()).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: 'Detalhes do produto' })).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: 'Avaliações de clientes' })).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: 'Perguntas frequentes' })).toBeAttached();
    await expect(page.getByRole('table').first()).toBeAttached();
  });

  test('slug inexistente: status 404 real', async ({ page }) => {
    const res = await page.goto('/produto-que-nao-existe/p');
    expect(res?.status()).toBe(404);
  });

  test('frete: formulario GET leva ao resultado com opcoes', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, needsJs);
    await page.goto('/produto-exemplo/p');
    await page.getByLabel('CEP').fill('01310100');
    await page.getByRole('button', { name: 'Calcular' }).click();
    await expect(page).toHaveURL(/\?cep=01310100#frete$/);
    await expect(page.locator('#frete').getByText('Entrega padrão')).toBeVisible();
    await expect(page.getByLabel('CEP')).toHaveValue('01310-100');
  });

  test('adicionar ao carrinho anuncia o resultado em aria-live', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, 'o envio sem recarregar e a regiao viva precisam de JavaScript');
    await page.goto('/produto-exemplo/p');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.locator('[role="status"][aria-live="polite"]').filter({ hasText: 'Adicionado ao carrinho.' })).toBeVisible();
  });

  test('zoom abre em dialogo e fecha com Esc', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, 'o zoom precisa de JavaScript (showModal)');
    await page.goto('/produto-exemplo/p');
    await page.getByRole('button', { name: 'Ampliar foto 1 de 1' }).click();
    await expect(page.getByRole('dialog', { name: 'Ampliar foto 1 de 1' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
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
