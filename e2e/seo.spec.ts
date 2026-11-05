import { expect, test, type APIRequestContext } from '@playwright/test';

// SEO e GEO lidos do HTML INICIAL (request HTTP, sem navegador): e exatamente o
// que crawlers e motores generativos recebem. Roda nos dois projetos; o conteudo
// nao depende de JavaScript. Base publica = SITE_URL (padrao do CI: localhost:3000).
const SITE = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function html(request: APIRequestContext, url: string) {
  const res = await request.get(url);
  return { status: res.status(), body: await res.text(), headers: res.headers() };
}

/** Nos do @graph de todos os blocos JSON-LD do HTML, por @type. */
function graphByType(body: string): Map<string, Node> {
  const blocks = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!) as Node);
  expect(blocks.length, 'ao menos um bloco JSON-LD no HTML inicial').toBeGreaterThan(0);
  const nodes = blocks.flatMap((b) => (b['@graph'] as Node[] | undefined) ?? [b]);
  return new Map(nodes.map((n) => [String(n['@type']), n]));
}

const unescapeXml = (s: string) => s.replaceAll('&amp;', '&');

const meta = (body: string, name: string) =>
  new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"|<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="${name}"`).exec(body)?.slice(1).find(Boolean);
const canonical = (body: string) =>
  /<link[^>]+rel="canonical"[^>]+href="([^"]+)"|<link[^>]+href="([^"]+)"[^>]+rel="canonical"/.exec(body)?.slice(1).find(Boolean);

test.describe('arquivos gerados', () => {
  test('robots.txt: segmentos exatos, politica de agentes e sitemap', async ({ request }) => {
    const { status, body, headers } = await html(request, '/robots.txt');
    expect(status).toBe(200);
    expect(headers['content-type']).toContain('text/plain');
    for (const line of ['Disallow: /s$', 'Disallow: /s/', 'Disallow: /s?', 'Disallow: /checkout$', 'Disallow: /api/']) expect(body).toContain(line);
    expect(body).not.toMatch(/^Disallow: \/s$/m); // prefixo solto bloquearia /saias
    expect(body).toMatch(/User-Agent: GPTBot\nAllow: \//);
    expect(body).toMatch(/User-Agent: CCBot\nDisallow: \/\n/);
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test('sitemap.xml e um indice; cada arquivo lista URLs absolutas indexaveis', async ({ request }) => {
    const index = await html(request, '/sitemap.xml');
    expect(index.status).toBe(200);
    expect(index.body).toContain('<sitemapindex');
    expect(index.body).toContain(`<loc>${SITE}/sitemap/product-1.xml</loc>`);
    const files = [...index.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.replace(SITE, ''));
    expect(files.length).toBeGreaterThanOrEqual(5);
    const all: string[] = [];
    for (const file of files) {
      const res = await html(request, file);
      expect(res.status, file).toBe(200);
      all.push(...[...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unescapeXml(m[1]!)));
    }
    expect(all).toContain(`${SITE}/produto-exemplo/p`);
    expect(all).toContain(`${SITE}/departamento-exemplo?brand=marca-1`);
    expect(all.some((u) => /^\/(s|checkout|carrinho|login|account)(\/|$)/.test(new URL(u).pathname))).toBe(false);
  });

  test('arquivo de sitemap inexistente e 404 real', async ({ request }) => {
    expect((await html(request, '/sitemap/product-999.xml')).status).toBe(404);
    expect((await html(request, '/sitemap/qualquer.xml')).status).toBe(404);
  });

  test('llms.txt: resumo citavel com politicas e links absolutos', async ({ request }) => {
    const { status, body, headers } = await html(request, '/llms.txt');
    expect(status).toBe(200);
    expect(headers['content-type']).toContain('text/plain');
    expect(body).toMatch(/^# .+\n\n> .+/);
    expect(body).toContain('## Políticas comerciais');
    expect(body).toContain(`](${SITE}/departamento-exemplo)`);
  });
});

test.describe('metadata e JSON-LD no HTML inicial', () => {
  test('home: Organization e WebSite com SearchAction; indexavel', async ({ request }) => {
    const { body } = await html(request, '/');
    const g = graphByType(body);
    expect(g.get('Organization')).toMatchObject({ url: SITE, address: { '@type': 'PostalAddress' } });
    expect(g.get('WebSite')?.potentialAction?.target?.urlTemplate).toBe(`${SITE}/s?q={search_term_string}`);
    expect([SITE, `${SITE}/`]).toContain(canonical(body));
    expect(meta(body, 'robots')).toMatch(/index/);
    expect(meta(body, 'robots')).not.toMatch(/noindex/);
    expect(meta(body, 'og:image')).toMatch(/^http/);
    expect(meta(body, 'twitter:card')).toBe('summary_large_image');
  });

  test('PDP: Product completo (oferta, avaliacao, frete, devolucao), breadcrumb e FAQ', async ({ request }) => {
    const { body } = await html(request, '/produto-exemplo/p');
    const g = graphByType(body);
    const product = g.get('Product')!;
    expect(product.name).toBe('Produto 1');
    expect(product.offers).toMatchObject({ priceCurrency: 'BRL', itemCondition: 'https://schema.org/NewCondition' });
    expect(product.offers.availability).toMatch(/^https:\/\/schema\.org\//);
    expect(product.offers.shippingDetails['@type']).toBe('OfferShippingDetails');
    expect(product.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy');
    expect(product.aggregateRating.reviewCount).toBeGreaterThan(0);
    expect(product.additionalProperty.length).toBeGreaterThan(0);
    expect(g.get('BreadcrumbList')!.itemListElement.at(-1).item).toBe(`${SITE}/produto-exemplo/p`);
    expect(g.get('FAQPage')!.mainEntity.length).toBeGreaterThanOrEqual(3);
    expect(canonical(body)).toBe(`${SITE}/produto-exemplo/p`);
    expect(meta(body, 'robots')).not.toMatch(/noindex/);
  });

  test('colecao: ItemList dos produtos da pagina, CollectionPage, FAQ e canonical proprio', async ({ request }) => {
    const { body } = await html(request, '/departamento-exemplo');
    const g = graphByType(body);
    const page = g.get('CollectionPage')!;
    const list = page.mainEntity;
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement.length).toBeGreaterThan(0);
    expect(list.itemListElement[0].url).toMatch(new RegExp(`^${SITE}/[a-z0-9-]+/p$`));
    expect(g.get('FAQPage')).toBeTruthy();
    // Na colecao o breadcrumb vai aninhado no CollectionPage (Rich Results aceita as duas formas).
    expect(page.breadcrumb['@type']).toBe('BreadcrumbList');
    expect(page.breadcrumb.itemListElement[0].name).toBe('Início');
    expect(canonical(body)).toBe(`${SITE}/departamento-exemplo`);
  });

  test('longtail e landing: JSON-LD e canonical', async ({ request }) => {
    const longtail = await html(request, '/b/palavra-chave-exemplo');
    expect(graphByType(longtail.body).get('FAQPage')).toBeTruthy();
    expect(canonical(longtail.body)).toBe(`${SITE}/b/palavra-chave-exemplo`);
    const landing = await html(request, '/campanha-exemplo');
    expect(graphByType(landing.body).get('BreadcrumbList')).toBeTruthy();
    expect(canonical(landing.body)).toBe(`${SITE}/campanha-exemplo`);
  });

  test('pagina institucional e mapa do site: WebPage', async ({ request }) => {
    expect(graphByType((await html(request, '/pagina-exemplo')).body).get('WebPage')).toBeTruthy();
    expect(graphByType((await html(request, '/mapa-do-site')).body).get('WebPage')).toBeTruthy();
  });
});

test.describe('politica de facetas e paginacao', () => {
  test('faceta indexavel isolada tem canonical proprio e continua indexavel', async ({ request }) => {
    const { body } = await html(request, '/departamento-exemplo?brand=marca-1');
    expect(canonical(body)).toBe(`${SITE}/departamento-exemplo?brand=marca-1`);
    expect(meta(body, 'robots')).not.toMatch(/noindex/);
  });

  test('price, ordenacao e faceta combinada: noindex,follow com canonical na colecao', async ({ request }) => {
    for (const url of ['/departamento-exemplo?price=ate-100', '/departamento-exemplo?sort=price_asc', '/departamento-exemplo?brand=marca-1&category=categoria-exemplo']) {
      const { body } = await html(request, url);
      expect(canonical(body), url).toBe(`${SITE}/departamento-exemplo`);
      expect(meta(body, 'robots'), url).toMatch(/noindex/);
      expect(meta(body, 'robots'), url).toMatch(/follow/);
    }
  });

  test('parametros de rastreio (utm_*) nao entram no canonical', async ({ request }) => {
    const { body } = await html(request, '/departamento-exemplo?utm_source=news&gclid=abc&fbclid=1');
    expect(canonical(body)).toBe(`${SITE}/departamento-exemplo`);
  });

  test('?page alem da ultima pagina e clampado e nao cria URL duplicada', async ({ request }) => {
    const { body } = await html(request, '/departamento-exemplo?page=2');
    // O mock tem menos de 24 produtos por departamento: so existe a pagina 1.
    expect(canonical(body)).toBe(`${SITE}/departamento-exemplo`);
  });
});

test.describe('paginas que nao indexam', () => {
  test('busca: noindex,nofollow', async ({ request }) => {
    const { body } = await html(request, '/s?q=produto');
    expect(meta(body, 'robots')).toMatch(/noindex/);
    expect(meta(body, 'robots')).toMatch(/nofollow/);
  });

  test('404 real, noindex', async ({ request }) => {
    const { status, body } = await html(request, '/slug-que-nao-existe');
    expect(status).toBe(404);
    expect(meta(body, 'robots')).toMatch(/noindex/);
  });
});
