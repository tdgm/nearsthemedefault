// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ManifestError, catalogSchema, generateTypes, propsSchema, refContext, vocabularySchema } from './index.ts';
import { listPresets, loadManifests } from './node.ts';

const root = resolve(__dirname, '../../..');
const nearsDir = join(root, 'nears');
const tokensFile = join(root, 'packages/tokens/tokens.json');

/** Copia /nears para um temp, aplica `edit` ao texto de um arquivo e tenta carregar. */
function loadMutated(file: string, edit: (text: string) => string, preset?: string) {
  const dir = mkdtempSync(join(tmpdir(), 'nears-'));
  cpSync(nearsDir, dir, { recursive: true });
  const path = join(dir, file);
  const before = readFileSync(path, 'utf8');
  const after = edit(before);
  expect(after, `a edicao nao alterou ${file}`).not.toBe(before);
  writeFileSync(path, after);
  return () => loadManifests({ nearsDir: dir, tokensFile, preset, repoRoot: root });
}

const messages = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof ManifestError) return e.issues.map((i) => `${i.file} > ${i.path}: ${i.message}`).join('\n');
    throw e;
  }
  return '';
};

describe('manifests reais', () => {
  it('carregam no nicho generic sem eixos de variacao', () => {
    const m = loadManifests({ nearsDir, tokensFile });
    expect(m.config.catalog.vertical).toBe('generic');
    expect(m.config.catalog.variantAxes).toEqual([]);
    expect(m.sections.sections.length).toBeGreaterThan(10);
  });

  it('tem ao menos 6 presets e todos carregam e geram tipos', () => {
    const presets = listPresets(nearsDir);
    expect(presets).toEqual(['beauty', 'electronics', 'fashion', 'grocery', 'home', 'pet']);
    for (const preset of presets) {
      const m = loadManifests({ nearsDir, tokensFile, preset });
      expect(m.config.catalog.vertical).toBe(preset);
      expect(generateTypes(m)).toContain(`Nicho configurado: ${preset}`);
    }
  });

  it('preset sobrescreve o vocabulario so nas chaves informadas', () => {
    const m = loadManifests({ nearsDir, tokensFile, preset: 'fashion' });
    expect(m.config.vocabulary.cart).toBe('Sacola');
    expect(m.config.vocabulary.bundle).toBe('Complete o look');
    expect(m.config.vocabulary.wishlist).toBe('Favoritos');
  });
});

describe('security.headers.contentSecurityPolicy (docs/adr/0025)', () => {
  it('strict-dynamic nao existe mais: exigiria render dinamico em toda rota', () => {
    const load = loadMutated('nears.config.yaml', (t) => t.replace('mode: baseline', 'mode: strict-dynamic'));
    expect(messages(load)).toContain('contentSecurityPolicy.mode');
  });

  it('formActionOrigins aceita so origem https pura', () => {
    for (const bad of ['http://checkout.exemplo.com.br', 'https://checkout.exemplo.com.br/', 'https://x.com.br/carrinho', 'checkout']) {
      const load = loadMutated('nears.config.yaml', (t) => t.replace('formActionOrigins: []', `formActionOrigins: ["${bad}"]`));
      expect(messages(load), bad).toContain('formActionOrigins');
    }
    const ok = loadMutated('nears.config.yaml', (t) => t.replace('formActionOrigins: []', 'formActionOrigins: ["https://checkout.exemplo.com.br"]'));
    expect(ok().config.security.headers.contentSecurityPolicy.formActionOrigins).toEqual(['https://checkout.exemplo.com.br']);
  });
});

describe('tipos gerados', () => {
  it('moda expoe os eixos color e size e a faceta size', () => {
    const out = generateTypes(loadManifests({ nearsDir, tokensFile, preset: 'fashion' }));
    expect(out).toContain('"id": "color"');
    expect(out).toContain('"id": "size"');
    expect(out).toContain('export const facetIds = ["category", "size", "color", "price", "brand"] as const;');
    expect(out).toContain('flatAxisSecondLevelAttribute: "fit"');
  });

  it('eletronicos tem voltagem e nao tem tamanho', () => {
    const out = generateTypes(loadManifests({ nearsDir, tokensFile, preset: 'electronics' }));
    expect(out).toContain('"id": "voltage"');
    expect(out).not.toContain('"id": "size"');
  });

  it('generic gera lista vazia de eixos e e deterministico', () => {
    const m = loadManifests({ nearsDir, tokensFile });
    const a = generateTypes(m);
    expect(a).toContain('export const variantAxes = [] as const;');
    expect(generateTypes(m)).toBe(a);
  });
});

describe('catalog', () => {
  const base = { productMedia: { aspect: 'product' }, facets: { available: ['category'] } };
  it('aceita o minimo e aplica padroes', () => {
    const c = catalogSchema.parse(base);
    expect(c.variantAxes).toEqual([]);
    expect(c.specTable.enabled).toBe(true);
    expect(c.flatAxis).toEqual({ enabled: true, secondLevelAttribute: null });
  });
  it.each([
    ['eixo duplicado', { variantAxes: [{ id: 'color', label: 'a', display: 'swatch' }, { id: 'color', label: 'b', display: 'option' }] }],
    ['faceta indexavel fora de available', { facets: { available: ['category'], indexable: ['brand'] } }],
    ['guide ligado sem label', { guide: { enabled: true } }],
    ['segundo nivel com eixo plano desligado', { flatAxis: { enabled: false, secondLevelAttribute: 'fit' } }],
    ['display invalido', { variantAxes: [{ id: 'color', label: 'a', display: 'dropdown' }] }],
    ['campo desconhecido', { colour: 1 }],
  ])('rejeita %s', (_name, extra) => {
    expect(catalogSchema.safeParse({ ...base, ...extra }).success).toBe(false);
  });
  it('vocabulary exige as chaves que o codigo le', () => {
    expect(vocabularySchema.safeParse({ cart: 'Carrinho' }).success).toBe(false);
  });
});

describe('referencias e invariantes cruzadas', () => {
  it('from: apontando para caminho inexistente do catalogo falha', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('catalog.facets.available', 'catalog.facets.disponiveis'));
    expect(messages(fn)).toContain('catalog.facets.disponiveis');
  });
  it('enabledBy com raiz desconhecida falha', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('catalog.flatAxis.enabled', 'loja.flatAxis.enabled'));
    expect(messages(fn)).toContain('raiz "loja" desconhecida');
  });
  it('aspecto de midia que nao existe em tokens.json falha', () => {
    const fn = loadMutated('nears.config.yaml', (t) => t.replace('aspect: product ', 'aspect: cinema  '));
    expect(messages(fn)).toContain('media.aspect');
  });
  it('section sem cwv falha o build', () => {
    const fn = loadMutated('sections.registry.yaml', (t) =>
      t.replace('    cwv: { reservedHeight: 44 }\n    a11y: { role: list }', '    a11y: { role: list }'),
    );
    expect(messages(fn)).toMatch(/benefit-bar|cwv/);
  });
  it('priority inherit sem nestedOnlyIn falha', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('    nestedOnlyIn: [product-grid, showcase, pdp-bundle, pdp-related]\n', ''));
    expect(messages(fn)).toContain('priority: inherit exige nestedOnlyIn');
  });
  it('template que usa section inexistente falha', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('[breadcrumb, section-title, event-banner, quick-filter,', '[breadcrumb, section-fantasma, event-banner, quick-filter,'));
    expect(messages(fn)).toContain('section "section-fantasma" nao existe');
  });
  it('section com priority inherit nao pode ser usada direto no template', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('sections: [section-title, showcase:recommended]', 'sections: [section-title, product-card]'));
    expect(messages(fn)).toContain('priority: inherit');
  });
  it('variante inexistente falha', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('showcase:recommended', 'showcase:aleatoria'));
    expect(messages(fn)).toContain('variante "aleatoria"');
  });
  it('estourar maxCriticalSections falha', () => {
    const fn = loadMutated('sections.registry.yaml', (t) => t.replace('maxCriticalSections: 4', 'maxCriticalSections: 1'));
    expect(messages(fn)).toContain('sections critical');
  });
  it('rota apontando para template inexistente falha', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('template: sitemap', 'template: mapa'));
    expect(messages(fn)).toContain('template "mapa" nao existe');
  });
  it('segmento literal fora de reserved.firstSegment falha', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('pattern: "/b/{keyword}"', 'pattern: "/blog/{keyword}"'));
    expect(messages(fn)).toContain('"blog" precisa estar em resolution.reserved.firstSegment');
  });
  it('faceta indexavel que tambem e neverIndexable falha', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('neverIndexable: [price,', 'neverIndexable: [brand, price,'));
    expect(messages(fn)).toContain('neverIndexable');
  });
  it('sitemap-html e obrigatorio', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('id: sitemap-html', 'id: mapa'));
    expect(messages(fn)).toContain('sitemap-html');
  });
  it('relata varias falhas de uma vez', () => {
    const fn = loadMutated('routes.manifest.yaml', (t) => t.replace('template: sitemap', 'template: mapa').replace('id: sitemap-html', 'id: x'));
    expect((messages(fn).match(/\n/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
});

describe('props -> Zod', () => {
  const props = (preset: string | undefined, id: string) => {
    const m = loadManifests({ nearsDir, tokensFile, preset });
    const section = [...m.sections.sections, ...m.sections.pdpSections].find((s) => s.id === id);
    if (!section) throw new Error(`section ${id}`);
    return propsSchema(section, refContext(m, { aspect: {}, sizes: {} }));
  };

  it('pdp-buybox generic: nicho sem variacao nao aceita seletores', () => {
    const s = props(undefined, 'pdp-buybox');
    expect(s.safeParse({ variantSelectors: [] }).success).toBe(true);
    expect(s.safeParse({ variantSelectors: [{ id: 'color' }] }).success).toBe(false);
  });
  it('pdp-buybox generic: guideHref e proibido com guide desligado', () => {
    const s = props(undefined, 'pdp-buybox');
    expect(s.safeParse({ guideHref: '/guia' }).success).toBe(false);
  });
  it('pdp-buybox moda: so aceita eixos do catalogo e guideHref', () => {
    const s = props('fashion', 'pdp-buybox');
    expect(s.safeParse({ variantSelectors: [{ id: 'color' }, { id: 'size' }], guideHref: '/guia' }).success).toBe(true);
    expect(s.safeParse({ variantSelectors: [{ id: 'voltage' }] }).success).toBe(false);
  });
  it('product-grid: facetas limitadas ao nicho e padroes aplicados', () => {
    const generic = props(undefined, 'product-grid');
    expect(generic.parse({}).pageSize).toBe(24);
    expect(generic.safeParse({ facets: ['category', 'brand'] }).success).toBe(true);
    expect(generic.safeParse({ facets: ['size'] }).success).toBe(false);
    expect(props('fashion', 'product-grid').safeParse({ facets: ['size'] }).success).toBe(true);
  });
  it('pdp-bundle: titulo padrao vem do vocabulario da loja', () => {
    expect(props(undefined, 'pdp-bundle').parse({}).title).toBe('Compre junto');
    expect(props('fashion', 'pdp-bundle').parse({}).title).toBe('Complete o look');
  });
  it('hero: exige ao menos 1 slide e alt em cada slide; imagem exige dimensoes', () => {
    const s = props(undefined, 'hero');
    const img = { src: '/a.avif', width: 1200, height: 600 };
    expect(s.safeParse({ slides: [] }).success).toBe(false);
    expect(s.safeParse({ slides: [{ imageDesktop: img, imageMobile: img }] }).success).toBe(false);
    expect(s.safeParse({ slides: [{ imageDesktop: img, imageMobile: img, alt: 'Banner' }] }).success).toBe(true);
    expect(s.safeParse({ slides: [{ imageDesktop: { src: '/a.avif' }, imageMobile: img, alt: 'x' }] }).success).toBe(false);
  });
  it('rejeita prop desconhecida (strict)', () => {
    expect(props(undefined, 'hero').safeParse({ slides: [{ alt: 'a', imageDesktop: { src: '/a', width: 1, height: 1 }, imageMobile: { src: '/a', width: 1, height: 1 } }], autoPlay: true }).success).toBe(false);
  });
  it('todas as sections geram schema em todos os nichos', () => {
    for (const preset of [undefined, ...listPresets(nearsDir)]) {
      const m = loadManifests({ nearsDir, tokensFile, preset });
      const ctx = refContext(m, { aspect: {}, sizes: {} });
      for (const s of [...m.sections.globals, ...m.sections.sections, ...m.sections.pdpSections]) {
        expect(() => propsSchema(s, ctx), `${preset ?? 'generic'}/${s.id}`).not.toThrow();
      }
    }
  });
});

describe('observability.rum', () => {
  it('carrega o bloco padrao (ligado, endpoint local, amostragem total)', () => {
    const m = loadManifests({ nearsDir, tokensFile });
    expect(m.config.observability.rum).toEqual({ enabled: true, endpoint: '/api/rum', sampleRate: 1 });
  });
  it('rejeita endpoint protocol-relative ou http e amostragem fora de 0..1', () => {
    for (const [from, to] of [
      ['endpoint: /api/rum', 'endpoint: //coletor.example/rum'],
      ['endpoint: /api/rum', 'endpoint: http://coletor.example/rum'],
      ['sampleRate: 1 ', 'sampleRate: 2 '],
    ] as const) {
      expect(messages(loadMutated('nears.config.yaml', (t) => t.replace(from, to))), to).toContain('observability');
    }
  });
  it('aceita coletor externo https', () => {
    const m = loadMutated('nears.config.yaml', (t) => t.replace('endpoint: /api/rum', 'endpoint: https://rum.nears.example/v1'))();
    expect(m.config.observability.rum.endpoint).toBe('https://rum.nears.example/v1');
  });
});

describe('thirdParties', () => {
  const ADR = 'docs/adr/0023-terceiros-com-partytown.md';
  const withScripts = (yaml: string) => loadMutated('nears.config.yaml', (t) => t.replace('  scripts: []', yaml));
  const gtm = (extra = '') =>
    `  scripts:\n    - id: gtm\n      integration: tagManager\n      src: https://www.googletagmanager.com/gtm.js?id=GTM-XXXX\n      forward: [dataLayer.push]\n      adr: ${ADR}\n${extra}`;

  it('padrao: nenhum terceiro (zero custo)', () => {
    expect(loadManifests({ nearsDir, tokensFile }).config.thirdParties.scripts).toEqual([]);
  });

  it('aceita um terceiro em worker com ADR existente e aplica os defaults', () => {
    const [script] = withScripts(gtm())().config.thirdParties.scripts;
    expect(script).toMatchObject({ id: 'gtm', strategy: 'partytown', forward: ['dataLayer.push'] });
  });

  it('recusa src http, ADR inexistente e id repetido', () => {
    expect(messages(withScripts(gtm().replace('https://', 'http://')))).toContain('thirdParties.scripts.0.src');
    expect(messages(withScripts(gtm().replace('0023-terceiros-com-partytown', '9999-nao-existe')))).toContain('nao existe');
    expect(messages(withScripts(gtm() + gtm().replace('  scripts:\n', '')))).toContain('repetido');
  });

  it('thread principal exige mainThreadReason e nao aceita forward', () => {
    const main = gtm('      strategy: idle\n');
    const text = messages(withScripts(main));
    expect(text).toContain('mainThreadReason');
    expect(text).toContain('forward so existe com strategy partytown');
    const ok = withScripts(
      `  scripts:\n    - id: reviews\n      integration: reviews\n      src: https://cdn.reviews.example/widget.js\n      strategy: post-interaction\n      adr: ${ADR}\n      mainThreadReason: Widget de avaliacoes manipula o DOM da pagina.\n`,
    )();
    expect(ok.config.thirdParties.scripts[0]?.strategy).toBe('post-interaction');
  });

  it('limite de hosts distintos vem de budgets.third_party_hosts', () => {
    const hosts = Array.from({ length: 9 }, (_, i) => `    - id: s${i}\n      integration: analytics\n      src: https://h${i}.example/a.js\n      adr: ${ADR}\n`).join('');
    expect(messages(withScripts(`  scripts:\n${hosts}`))).toContain('limite budgets.third_party_hosts = 8');
  });
});
