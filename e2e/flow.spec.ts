import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { presetExpectations, type PresetExpectation } from './presets';

// Fluxo de compra completo (descoberta -> PLP -> PDP -> carrinho) rodando em um
// preset de nicho por vez. O servidor sobe com NEARS_PRESET=<preset> (playwright.config.ts,
// scripts/test-e2e-presets.mjs; docs/adr/0024). O mesmo teste vale para todo nicho:
// eixos de variacao, facetas, microcopy e atributos GEO vem de `presetExpectations`,
// que o vitest confere contra nears/presets/*.yaml.
const presetName = process.env.NEARS_PRESET?.trim() ?? '';
const expected: PresetExpectation | undefined = presetExpectations[presetName];

const CATEGORY_HREF = '/departamento-exemplo/categoria-exemplo';
const PRODUCT_HREF = '/produto-exemplo/p';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exact = (s: string) => new RegExp(`^${escapeRe(s)}$`);

async function robotsOf(page: Page) {
  return page.locator('meta[name="robots"]').first().getAttribute('content');
}

async function noViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
}

test.beforeAll(() => {
  expect(expected, `NEARS_PRESET="${presetName}" precisa existir em e2e/presets.ts (${Object.keys(presetExpectations).join(', ')})`).toBeDefined();
});

test.describe('fluxo de compra por nicho', () => {
  test('home: carrinho do header usa o vocabulario do preset', async ({ page }) => {
    const e = expected!;
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('banner').getByRole('button', { name: new RegExp(`^${escapeRe(e.cart)}`) })).toBeVisible();
    await noViolations(page);
  });

  test('descoberta -> PLP -> PDP -> carrinho', async ({ page, request }) => {
    const e = expected!;

    // 1. Descoberta: da home para a colecao pelo hub de categorias.
    await page.goto('/');
    await page.locator(`main a[href="${CATEGORY_HREF}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${escapeRe(CATEGORY_HREF)}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    // 2. PLP: grade de produtos como lista real e filtros do nicho no drawer.
    const cards = page.locator('main ul > li').filter({ has: page.locator('h3') });
    await expect(cards.first()).toBeVisible();
    const total = await cards.count();
    expect(total).toBeGreaterThan(1);
    await noViolations(page);

    await page.getByRole('button', { name: 'Filtrar' }).click();
    const drawer = page.getByRole('dialog', { name: 'Filtros' });
    await expect(drawer).toBeVisible();
    for (const facet of e.axisFacets) {
      const group = drawer.getByRole('group', { name: exact(facet.label) });
      await expect(group, `faceta ${facet.id} (${facet.label})`).toBeVisible();
      expect(await group.getByRole('checkbox').count(), `opcoes da faceta ${facet.id}`).toBeGreaterThan(0);
    }

    // 3. Faceta fora de catalog.facets.indexable: filtra e vira noindex,follow.
    const nonIndexable = e.axisFacets.find((f) => f.id === e.nonIndexableFacet)!;
    await drawer.getByRole('group', { name: exact(nonIndexable.label) }).getByRole('checkbox').first().check({ force: true });
    await drawer.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(page).toHaveURL(new RegExp(`[?&]${e.nonIndexableFacet}=`));
    expect(await robotsOf(page)).toMatch(/noindex/);

    // 4. Faceta indexavel com um valor: continua indexavel, canonical de si mesma.
    const { id, value } = e.indexableFacet;
    const indexableRes = await request.get(`${CATEGORY_HREF}?${id}=${value}`);
    expect(indexableRes.status()).toBe(200);
    const indexableHtml = await indexableRes.text();
    expect(indexableHtml).toMatch(/<meta name="robots" content="index/);
    expect(indexableHtml).not.toMatch(/<meta name="robots" content="[^"]*noindex/);

    // 5. PLP -> PDP pelo primeiro card da colecao.
    await page.goto(CATEGORY_HREF);
    const firstCardLink = page.locator('main ul > li h3 a').first();
    const productHref = await firstCardLink.getAttribute('href');
    expect(productHref).toMatch(/\/p$/);
    await firstCardLink.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRe(productHref!)}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('button', { name: exact(e.addToCart) })).toBeVisible();
    await noViolations(page);
  });

  test('PDP: um radiogroup por eixo do nicho, atributos GEO e JSON-LD completo', async ({ page }) => {
    const e = expected!;
    await page.goto(PRODUCT_HREF);

    // Exatamente os eixos do preset, na ordem declarada, e nenhum a mais.
    const form = page.locator('#pdp-form');
    await expect(form.getByRole('radiogroup')).toHaveCount(e.axes.length);
    for (const axis of e.axes) {
      const group = form.getByRole('radiogroup', { name: new RegExp(`^${escapeRe(axis.label)}`) });
      await expect(group, `eixo ${axis.id}`).toBeVisible();
      expect(await group.getByRole('radio').count(), `opcoes de ${axis.id}`).toBeGreaterThanOrEqual(2);
    }
    const legends = await form.locator('legend').allTextContents();
    expect(legends.map((l) => l.split(':')[0]!.trim())).toEqual(e.axes.map((a) => a.label));

    // Atributos GEO que nenhum eixo cobre: tabela de especificacao em HTML semantico. Fica
    // num accordion fechado, entao o que importa e existir no HTML (includeHidden), nao estar visivel.
    const specs = page.locator('table').filter({ hasText: e.geoSpecs[0]! }).first();
    await expect(specs).toHaveCount(1);
    for (const attr of e.geoSpecs) {
      await expect(specs.getByRole('rowheader', { name: new RegExp(`^${escapeRe(attr)}$`, 'i'), includeHidden: true })).toHaveCount(1);
    }

    // JSON-LD do HTML inicial: Product com os atributos do nicho em additionalProperty.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = blocks.flatMap((b) => {
      const json = JSON.parse(b) as Record<string, unknown>;
      return (json['@graph'] as Record<string, unknown>[] | undefined) ?? [json];
    });
    const product = nodes.find((n) => n['@type'] === 'Product') as { additionalProperty?: { name: string }[] } | undefined;
    expect(product, 'Product no JSON-LD').toBeDefined();
    const names = (product!.additionalProperty ?? []).map((p) => p.name.toLowerCase());
    for (const attr of e.geoSpecs) expect(names, `additionalProperty.${attr}`).toContain(attr);
  });

  test('PDP -> carrinho: eixo obrigatorio, anuncio em aria-live e minicart no vocabulario do nicho', async ({ page }) => {
    const e = expected!;
    await page.goto(PRODUCT_HREF);

    const form = page.locator('#pdp-form');
    const status = form.getByRole('status');
    const add = page.getByRole('button', { name: exact(e.addToCart) });

    // Sem escolher nenhuma variacao o envio e barrado pela validacao nativa (radiogroup required).
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith('/api/cart/items')) posted = true;
    });
    await add.click();
    expect(await form.getByRole('radio').first().evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(posted).toBe(false);
    await expect(status).toHaveText('');

    // Escolhe a primeira opcao disponivel de cada eixo do nicho.
    for (const axis of e.axes) {
      const group = form.getByRole('radiogroup', { name: new RegExp(`^${escapeRe(axis.label)}`) });
      await group.locator('input[type="radio"]:not(:disabled)').first().check({ force: true });
      await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
    }

    // Adiciona: POST 200 e anuncio no aria-live com o nome de carrinho do preset.
    const response = page.waitForResponse((r) => r.url().endsWith('/api/cart/items') && r.request().method() === 'POST');
    await add.click();
    expect((await response).status()).toBe(200);
    await expect(status).toHaveText(e.addedToCart);
    await expect(status).toHaveAttribute('aria-live', 'polite');

    // O carrinho do header abre como dialog com o nome do preset e fecha com Esc.
    const cartButton = page.getByRole('banner').getByRole('button', { name: new RegExp(`^${escapeRe(e.cart)}`) });
    await cartButton.click();
    const dialog = page.getByRole('dialog', { name: exact(e.cart) });
    await expect(dialog).toBeVisible();
    await noViolations(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(cartButton).toBeFocused();
  });
});
