import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProducts, getStore } from '../lib/data/client';
import { loadAllManifests } from '../lib/manifest';
import {
  absoluteAsset,
  absoluteUrl,
  breadcrumbNode,
  clampDescription,
  collectionPageNode,
  enforceGeoCompleteness,
  faqNode,
  graph,
  itemListNode,
  missingGeoFields,
  organizationNode,
  parseRobots,
  productNode,
  robotsFor,
  serializeJsonLd,
  siteUrl,
  websiteNode,
  type JsonLd,
  type SeoContext,
} from '../lib/seo';
import { buildPdpView } from '../lib/templates/pdp-content';

const SITE = 'https://loja.example';
const ctx = async (): Promise<SeoContext> => ({ site: SITE, store: await getStore() });
const asObj = (v: unknown) => v as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('site', () => {
  it('usa SITE_URL (origem), sem barra final nem caminho', () => {
    vi.stubEnv('SITE_URL', 'https://loja.example/qualquer/coisa/');
    expect(siteUrl()).toBe('https://loja.example');
  });
  it('recusa SITE_URL invalida ou que nao seja http(s)', () => {
    vi.stubEnv('SITE_URL', 'nao-e-url');
    expect(() => siteUrl()).toThrow(/invalida/);
    vi.stubEnv('SITE_URL', 'ftp://loja.example');
    expect(() => siteUrl()).toThrow(/http/);
  });
  it('absoluteUrl so aceita caminho da propria loja (nada de //host)', () => {
    expect(absoluteUrl('/a?page=2', SITE)).toBe('https://loja.example/a?page=2');
    expect(() => absoluteUrl('//evil.example', SITE)).toThrow();
    expect(() => absoluteUrl('https://evil.example', SITE)).toThrow();
  });
  it('absoluteAsset aceita URL absoluta (CDN) e prefixa caminho relativo', () => {
    expect(absoluteAsset('https://cdn.example/a.jpg', SITE)).toBe('https://cdn.example/a.jpg');
    expect(absoluteAsset('/placeholders/a.jpg', SITE)).toBe('https://loja.example/placeholders/a.jpg');
  });
});

describe('metadata helpers', () => {
  it('clampDescription respeita o limite sem partir palavra e normaliza espacos', () => {
    const long = 'palavra '.repeat(40);
    const out = clampDescription(long, 158);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/palav…$/);
    expect(clampDescription('  curto   texto ', 158)).toBe('curto texto');
  });
  it('parseRobots converte diretivas e falha alto numa desconhecida', () => {
    expect(parseRobots('noindex,nofollow')).toEqual({ index: false, follow: false });
    expect(parseRobots('index,follow,max-image-preview:large')).toEqual({ index: true, follow: true, 'max-image-preview': 'large' });
    expect(() => parseRobots('noindex,banana')).toThrow(/banana/);
  });
  it('robotsFor segue o contrato: busca e 404 noindex, o resto usa o padrao global', () => {
    expect(robotsFor('search')).toBe('noindex,nofollow');
    expect(robotsFor('notfound')).toBe('noindex,nofollow');
    expect(robotsFor('pdp')).toBe(loadAllManifests().contracts.seo.global.robotsDefault);
    expect(robotsFor('collection', 'noindex,follow')).toBe('noindex,follow');
  });
});

describe('JSON-LD', () => {
  it('serializeJsonLd escapa < e separadores de linha (nada fecha o <script>)', () => {
    const out = serializeJsonLd({ a: '</script><b>', b: 'x\u2028y' });
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
    expect(out).toContain('\\u2028');
    expect(JSON.parse(out)).toEqual({ a: '</script><b>', b: 'x\u2028y' });
  });

  it('graph junta os nos, descarta vazios e poe @context so no topo', () => {
    const g = graph({ '@type': 'A' }, null, undefined, { '@type': 'B' });
    expect(g['@context']).toBe('https://schema.org');
    expect(g['@graph']).toEqual([{ '@type': 'A' }, { '@type': 'B' }]);
  });

  it('Organization traz NAP, logo absoluto e sameAs da entidade', async () => {
    const org = asObj(organizationNode(await ctx()));
    expect(org['@type']).toBe('Organization');
    expect(org.url).toBe(SITE);
    expect(org.logo.url).toBe(`${SITE}/logo-placeholder.svg`);
    expect(org.address['@type']).toBe('PostalAddress');
    expect(org.address.addressCountry).toBe('BR');
    expect(org.sameAs.length).toBeGreaterThan(0);
    expect(org.foundingDate).toBe('2020-01-15');
  });

  it('WebSite aponta o SearchAction para a rota de busca', async () => {
    const site = asObj(websiteNode(await ctx(), '/s'));
    expect(site.potentialAction.target.urlTemplate).toBe(`${SITE}/s?q={search_term_string}`);
    expect(site.potentialAction['query-input']).toBe('required name=search_term_string');
  });

  it('BreadcrumbList numera de 1 e usa a URL da pagina no ultimo item', () => {
    const b = asObj(breadcrumbNode([{ label: 'Início', href: '/' }, { label: 'Dep', href: '/dep' }, { label: 'Atual' }], '/dep/atual', SITE));
    expect(b.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(b.itemListElement[2].item).toBe(`${SITE}/dep/atual`);
  });

  it('ItemList e CollectionPage encadeiam; FAQPage vazio some', () => {
    const list = itemListNode([{ name: 'A', path: '/a/p' }, { name: 'B', path: '/b/p' }], SITE);
    expect(asObj(list).numberOfItems).toBe(2);
    expect(asObj(list).itemListElement[1].url).toBe(`${SITE}/b/p`);
    const page = asObj(collectionPageNode({ site: SITE } as SeoContext, { name: 'Col', description: 'd', path: '/col', mainEntity: list }));
    expect(page['@type']).toBe('CollectionPage');
    expect(page.mainEntity['@type']).toBe('ItemList');
    expect(faqNode([])).toBeNull();
    expect(asObj(faqNode([{ question: 'Q?', answer: 'R.' }])).mainEntity[0].acceptedAnswer.text).toBe('R.');
  });
});

describe('Product JSON-LD (contracts.yaml > data.product)', () => {
  const build = async (slug: string): Promise<JsonLd> => {
    const view = (await buildPdpView(slug))!;
    return productNode(await ctx(), { product: view.product, path: `/${slug}/p`, breadcrumb: view.breadcrumb });
  };

  it('emite Offer completo com shippingDetails e hasMerchantReturnPolicy', async () => {
    const p = asObj(await build('produto-exemplo'));
    expect(p['@type']).toBe('Product');
    expect(p.sku).toBe('SKU-0001');
    expect(p.gtin).toMatch(/^\d{13}$/);
    expect(p.brand.name).toBe('Marca 1');
    expect(p.image[0]).toBe(`${SITE}/placeholders/product.svg`);
    expect(p.offers.priceCurrency).toBe('BRL');
    expect(p.offers.price).toBe('59.90');
    expect(p.offers.availability).toBe('https://schema.org/InStock');
    expect(p.offers.itemCondition).toBe('https://schema.org/NewCondition');
    expect(p.offers.priceValidUntil).toBe('2027-12-31');
    expect(p.offers.shippingDetails.deliveryTime.transitTime).toMatchObject({ minValue: 2, maxValue: 8, unitCode: 'DAY' });
    expect(p.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(30);
    expect(p.offers.hasMerchantReturnPolicy.returnFees).toBe('https://schema.org/FreeReturn');
    expect(p.aggregateRating).toMatchObject({ '@type': 'AggregateRating', bestRating: 5 });
    expect(p.review).toHaveLength(2);
    expect(p.review[0].datePublished).toBe('2026-03-10');
    expect(p.additionalProperty[0]).toEqual({ '@type': 'PropertyValue', name: 'Marca', value: 'Marca 1' });
  });

  it('frete vira 0 acima do limite de frete gratis', async () => {
    const cheap = asObj(await build('produto-exemplo'));
    const expensive = asObj(await build('produto-24')); // 49,9 + 240 = 289,9 -> ainda abaixo de 299
    const view = (await buildPdpView('produto-exemplo'))!;
    const rich = asObj(productNode(await ctx(), { product: { ...view.product, price: 400 }, path: '/x/p', breadcrumb: view.breadcrumb }));
    expect(cheap.offers.shippingDetails.shippingRate.value).toBe('19.90');
    expect(expensive.offers.shippingDetails.shippingRate.value).toBe('19.90');
    expect(rich.offers.shippingDetails.shippingRate.value).toBe('0.00');
  });

  it('disponibilidade fora de estoque e pre-venda mapeiam para o schema.org', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const out = asObj(productNode(await ctx(), { product: { ...view.product, availability: 'out_of_stock' }, path: '/x/p', breadcrumb: view.breadcrumb }));
    const pre = asObj(productNode(await ctx(), { product: { ...view.product, availability: 'preorder' }, path: '/x/p', breadcrumb: view.breadcrumb }));
    expect(out.offers.availability).toBe('https://schema.org/OutOfStock');
    expect(pre.offers.availability).toBe('https://schema.org/PreOrder');
  });

  it('nunca inventa campo ausente: sem avaliacao, o aggregateRating some', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const { rating: _r, ...semRating } = view.product;
    const p = asObj(productNode(await ctx(), { product: { ...semRating, reviews: [] }, path: '/x/p', breadcrumb: view.breadcrumb }));
    expect(p.aggregateRating).toBeUndefined();
    expect(p.review).toBeUndefined();
  });

  it('o catalogo inteiro de exemplo e GEO-completo (cobertura 1.0)', async () => {
    for (const product of await getProducts()) expect(missingGeoFields(product), product.slug).toEqual([]);
  });
});

describe('onMissingGeoField', () => {
  const incomplete = async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const { rating: _r, ...rest } = view.product;
    return { ...rest, specs: [] };
  };

  it('lista o que falta: avaliacao e tabela de specs', async () => {
    expect(missingGeoFields(await incomplete())).toEqual(['aggregateRating', 'additionalProperty']);
  });

  it('exige os geoAttributes do nicho (por spec ou por eixo de variacao)', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const m = structuredClone(loadAllManifests());
    m.config.catalog.geoAttributes = ['material'];
    expect(missingGeoFields(view.product, m)).toEqual(['material']);
    expect(missingGeoFields({ ...view.product, specs: [...view.product.specs, { name: 'Material', value: 'Algodão' }] }, m)).toEqual([]);
    m.config.catalog.geoAttributes = ['color'];
    m.config.catalog.variantAxes = [{ id: 'color', label: 'Cor', display: 'swatch', schemaOrg: 'color' }];
    expect(missingGeoFields(view.product, m)).toEqual([]);
  });

  it('segue o modo do contrato: warn-build avisa, fail-build derruba o build', async () => {
    const product = await incomplete();
    const m = structuredClone(loadAllManifests());
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    m.contracts.data.product.onMissingGeoField = 'warn-build';
    expect(() => enforceGeoCompleteness(product, m)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aggregateRating'));
    m.contracts.data.product.onMissingGeoField = 'fail-build';
    expect(() => enforceGeoCompleteness(product, m)).toThrow(/aggregateRating/);
  });
});
