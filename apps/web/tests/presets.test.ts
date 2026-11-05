import { resolve } from 'node:path';
import { loadManifests, listPresets } from '@nears/manifests/node';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { E2E_PRESETS, presetExpectations } from '../../../e2e/presets';
import { buildMockSnapshot } from '../lib/data/mock';
import { catalogSnapshotSchema } from '../lib/data/schemas';
import { selectedPreset } from '../lib/manifest';
import { nearsDir, repoRoot } from '../lib/repo';
import { missingGeoFields } from '../lib/seo';

const tokensFile = resolve(repoRoot, 'packages/tokens/tokens.json');

describe('NEARS_PRESET (docs/adr/0024)', () => {
  it('vazio ou ausente = catalogo do nears.config.yaml', () => {
    expect(selectedPreset({})).toBeUndefined();
    expect(selectedPreset({ NEARS_PRESET: '' })).toBeUndefined();
    expect(selectedPreset({ NEARS_PRESET: '  ' })).toBeUndefined();
  });

  it('aceita nome de preset e rejeita qualquer coisa que vire caminho', () => {
    expect(selectedPreset({ NEARS_PRESET: 'electronics' })).toBe('electronics');
    for (const bad of ['../nears.config', 'a/b', 'Fashion', '-x', 'x.yaml', 'x y']) {
      expect(() => selectedPreset({ NEARS_PRESET: bad }), bad).toThrow(/NEARS_PRESET invalido/);
    }
  });
});

describe('catalogo de exemplo em cada preset de nicho', () => {
  for (const preset of listPresets(nearsDir)) {
    it(`${preset}: snapshot valido e produtos GEO-completos`, () => {
      const m = loadManifests({ nearsDir, tokensFile, preset });
      const snapshot = catalogSnapshotSchema.parse(buildMockSnapshot(m.config.catalog));
      for (const product of snapshot.products) {
        expect(missingGeoFields(product, m), `${preset}/${product.slug}`).toEqual([]);
        // Um conjunto de opcoes por eixo do nicho, na ordem declarada.
        expect(product.variants.map((v) => v.axis)).toEqual(m.config.catalog.variantAxes.map((a) => a.id));
      }
    });
  }

  it('o preset muda os eixos oferecidos pelo produto (moda x eletronicos)', () => {
    const axes = (preset: string) =>
      buildMockSnapshot(loadManifests({ nearsDir, tokensFile, preset }).config.catalog).products[0]!.variants.map((v) => v.axis);
    expect(axes('fashion')).toEqual(['color', 'size']);
    expect(axes('electronics')).toEqual(['color', 'voltage', 'storage']);
  });

  it('eixo de amostra tem opcao indisponivel e eixo de texto nao', () => {
    const { variants } = buildMockSnapshot(loadManifests({ nearsDir, tokensFile, preset: 'fashion' }).config.catalog).products[0]!;
    expect(variants.find((v) => v.axis === 'color')!.options.some((o) => o.unavailable)).toBe(true);
    expect(variants.find((v) => v.axis === 'size')!.options.some((o) => o.unavailable)).toBe(false);
  });
});

describe('vocabulario dos presets', () => {
  it('carrinho, CTA e anuncio de adicionado andam juntos (sacola, cesta, carrinho)', () => {
    const vocab = (preset?: string) => loadManifests({ nearsDir, tokensFile, ...(preset ? { preset } : {}) }).config.vocabulary;
    expect(vocab('fashion')).toMatchObject({ cart: 'Sacola', addToCart: 'Adicionar à sacola', addedToCart: 'Adicionado à sacola.' });
    expect(vocab('grocery')).toMatchObject({ cart: 'Cesta', addToCart: 'Adicionar à cesta', addedToCart: 'Adicionado à cesta.' });
    expect(vocab('electronics')).toMatchObject({ cart: 'Carrinho', addToCart: 'Adicionar ao carrinho', addedToCart: 'Adicionado ao carrinho.' });
  });

  it('toda faceta de eixo de variacao tem rotulo no vocabulario do preset', () => {
    for (const preset of ['fashion', 'electronics']) {
      const { config } = loadManifests({ nearsDir, tokensFile, preset });
      for (const axis of config.catalog.variantAxes) {
        if (!config.catalog.facets.available.includes(axis.id)) continue;
        const key = `facet${axis.id.charAt(0).toUpperCase()}${axis.id.slice(1)}`;
        expect(config.vocabulary[key], `${preset}.${key}`).toBeTruthy();
      }
    }
  });
});

describe('facetas de eixo de variacao', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('lista as opcoes que os produtos oferecem, com rotulo e contagem', async () => {
    vi.stubEnv('NEARS_PRESET', 'fashion');
    vi.resetModules(); // o data layer guarda o snapshot em cache de modulo
    const { queryCollection } = await import('../lib/data/collections');
    const query = { filters: {}, sort: 'relevance', page: 1, pageSize: 24 };
    const { facets, total } = await queryCollection({}, query, ['size', 'color'], { size: 'Tamanho', color: 'Cor' });
    const size = facets.find((f) => f.id === 'size')!;
    expect(size.label).toBe('Tamanho');
    expect(size.options.map((o) => o.label)).toEqual(['Tamanho 1', 'Tamanho 2', 'Tamanho 3']);
    expect(size.options.every((o) => o.count === total)).toBe(true);

    const filtered = await queryCollection({}, { ...query, filters: { color: ['color-1'] } }, ['color'], {});
    expect(filtered.total).toBe(total);
    const none = await queryCollection({}, { ...query, filters: { color: ['inexistente'] } }, ['color'], {});
    expect(none.total).toBe(0);
  });

  it('sem eixos no nicho a faceta fica sem opcoes (nunca erro)', async () => {
    vi.resetModules();
    const { queryCollection } = await import('../lib/data/collections');
    const { facets } = await queryCollection({}, { filters: {}, sort: 'relevance', page: 1, pageSize: 24 }, ['size'], {});
    expect(facets).toEqual([{ id: 'size', label: 'size', options: [] }]);
  });
});

describe('e2e/presets.ts acompanha nears/presets/*.yaml', () => {
  it('cobre ao menos dois presets de nicho e todos existem', () => {
    expect(E2E_PRESETS.length).toBeGreaterThanOrEqual(2);
    for (const preset of E2E_PRESETS) expect(listPresets(nearsDir)).toContain(preset);
  });

  for (const preset of E2E_PRESETS) {
    it(`${preset}: microcopy, eixos, facetas e atributos GEO`, () => {
      const e = presetExpectations[preset]!;
      const { config } = loadManifests({ nearsDir, tokensFile, preset });
      const { catalog, vocabulary } = config;

      expect({ cart: vocabulary.cart, addToCart: vocabulary.addToCart, addedToCart: vocabulary.addedToCart }).toEqual({
        cart: e.cart,
        addToCart: e.addToCart,
        addedToCart: e.addedToCart,
      });
      expect(catalog.variantAxes.map(({ id, label }) => ({ id, label }))).toEqual(e.axes);

      const axisIds = new Set(catalog.variantAxes.map((a) => a.id));
      const axisFacets = catalog.facets.available.filter((f) => axisIds.has(f)).map((id) => ({ id, label: vocabulary[`facet${id.charAt(0).toUpperCase()}${id.slice(1)}`] }));
      expect(axisFacets).toEqual(e.axisFacets);

      const covered = new Set(catalog.variantAxes.map((a) => a.schemaOrg));
      expect(catalog.geoAttributes.filter((a) => !covered.has(a))).toEqual(e.geoSpecs);

      expect(catalog.facets.available).toContain(e.nonIndexableFacet);
      expect(catalog.facets.indexable).not.toContain(e.nonIndexableFacet);
      expect(catalog.facets.indexable).toContain(e.indexableFacet.id);
    });
  }
});
