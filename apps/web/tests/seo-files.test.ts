import { describe, expect, it } from 'vitest';
import { getCampaigns, getDepartments, getPages, getProductTypes, getStore } from '../lib/data/client';
import { loadAllManifests } from '../lib/manifest';
import {
  buildLlmsTxt,
  buildRobots,
  buildQuery,
  chunk,
  collectSitemapEntries,
  decideFacetPolicy,
  disallowLines,
  paginationLinks,
  parseSitemapFileName,
  renderSitemapIndex,
  renderUrlset,
  sitemapFiles,
} from '../lib/seo';

const SITE = 'https://loja.example';

/** Semantica de casamento do robots.txt (RFC 9309): prefixo; `$` ancora o fim; `*` e curinga. */
function blocked(path: string, rules: string[]): boolean {
  return rules.some((rule) => {
    const anchored = rule.endsWith('$');
    const pattern = rule.replace(/\$$/, '').replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${pattern}${anchored ? '$' : ''}`).test(path);
  });
}

describe('robots.txt', () => {
  const m = loadAllManifests();
  const lines = disallowLines(m);

  it('gera tres linhas exatas por segmento, nunca prefixo solto', () => {
    for (const seg of m.routes.excluded.disallowSegments) {
      expect(lines).toContain(`/${seg}$`);
      expect(lines).toContain(`/${seg}/`);
      expect(lines).toContain(`/${seg}?`);
      expect(lines).not.toContain(`/${seg}`);
    }
    expect(lines).toContain('/api/');
  });

  it('bloqueia as rotas privadas e libera slugs que so COMECAM igual (/saias, /carrinho-de-bebe)', () => {
    for (const path of ['/s', '/s?q=camisa', '/s/x', '/carrinho', '/checkout/pagamento', '/login', '/account/pedidos', '/api/cart/items', '/quick-view/x']) {
      expect(blocked(path, lines), path).toBe(true);
    }
    for (const path of ['/saias', '/sofas', '/smartphones', '/sobre', '/carrinho-de-bebe', '/accountability', '/loginho', '/b/palavra-chave', '/produto-exemplo/p']) {
      expect(blocked(path, lines), path).toBe(false);
    }
  });

  it('aplica a politica de agentes do contrato (allow repete os Disallow; disallow bloqueia tudo)', () => {
    const robots = buildRobots(m, SITE);
    const rules = robots.rules as { userAgent: string; allow?: string; disallow?: string | string[] }[];
    const byAgent = new Map(rules.map((r) => [r.userAgent, r]));
    expect(byAgent.get('*')?.disallow).toEqual(lines);
    for (const [agent, policy] of Object.entries(m.contracts.geo.agents)) {
      const rule = byAgent.get(agent)!;
      if (policy === 'allow') expect(rule.disallow).toEqual(lines);
      else expect(rule.disallow).toBe('/');
    }
    expect(byAgent.get('GPTBot')?.allow).toBe('/');
    expect(byAgent.get('CCBot')?.disallow).toBe('/');
    expect(robots.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it('agente em "decide" falha alto: a decisao de negocio nao pode ficar implicita', () => {
    const copy = structuredClone(m);
    copy.contracts.geo.agents.GPTBot = 'decide';
    expect(() => buildRobots(copy, SITE)).toThrow(/decide/);
  });

  it('todo segmento bloqueado e reservado (nenhuma loja publica uma pagina que o robots esconde)', () => {
    for (const seg of m.routes.excluded.disallowSegments) expect(m.routes.resolution.reserved.firstSegment).toContain(seg);
    expect(m.routes.resolution.reserved.firstSegment).toContain('sitemap');
  });
});

describe('sitemap', () => {
  const m = loadAllManifests();

  it('coleta todos os segmentos do manifest, com produtos, categorias, longtail, campanha e paginas', async () => {
    const segments = await collectSitemapEntries(new Date('2026-11-05T12:00:00Z'));
    expect(Object.keys(segments)).toEqual(m.routes.sitemapXml.segments);
    const paths = (s: string) => segments[s]!.map((e) => e.path);
    expect(paths('product')).toContain('/produto-exemplo/p');
    expect(paths('product')).toHaveLength(24);
    expect(paths('category')).toEqual(expect.arrayContaining(['/departamento-exemplo', '/departamento-exemplo/categoria-exemplo', '/departamento-exemplo/categoria-exemplo/sub-exemplo', '/tipo-exemplo']));
    expect(paths('longtail')).toEqual(['/b/palavra-chave-exemplo']);
    expect(paths('campaign')).toEqual(['/campanha-exemplo', '/campanha-exemplo/segmento-exemplo']);
    expect(paths('page')).toEqual(expect.arrayContaining(['/', '/mapa-do-site', '/pagina-exemplo']));
  });

  it('nao lista rota noindex nem bloqueada pelo robots', async () => {
    const lines = disallowLines(m);
    const all = Object.values(await collectSitemapEntries(new Date('2026-11-05T12:00:00Z'))).flat();
    for (const e of all) expect(blocked(e.path, lines), e.path).toBe(false);
  });

  it('campanha fora da janela sai do sitemap (a rota redireciona)', async () => {
    const segments = await collectSitemapEntries(new Date('2100-06-01T00:00:00Z'));
    expect(segments.campaign).toEqual([]);
  });

  it('facetas indexaveis isoladas entram no segmento brand como ?faceta=valor', async () => {
    const segments = await collectSitemapEntries(new Date('2026-11-05T12:00:00Z'));
    const brand = segments.brand!.map((e) => e.path);
    expect(brand).toContain('/departamento-exemplo?brand=marca-1');
    expect(brand.every((p) => /^\/[a-z0-9-]+\?brand=marca-\d$/.test(p))).toBe(true);
    expect(brand.some((p) => p.includes('category='))).toBe(false); // category ja tem pagina propria
  });

  it('divide em arquivos de maxUrlsPerFile e omite segmento vazio', () => {
    const files = sitemapFiles({ product: Array.from({ length: 5 }, (_, i) => ({ path: `/p${i}/p` })), vazio: [] }, 2);
    expect(files.map((f) => `${f.segment}-${f.page}:${f.entries.length}`)).toEqual(['product-1:2', 'product-2:2', 'product-3:1']);
    expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });

  it('XML valido: URLs absolutas, & escapado, lastmod so quando informado', () => {
    const xml = renderUrlset([{ path: '/a?x=1&y=2' }, { path: '/b', lastmod: '2026-01-02' }], SITE);
    expect(xml).toContain('<loc>https://loja.example/a?x=1&amp;y=2</loc>');
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
    const index = renderSitemapIndex([{ segment: 'product', page: 2 }], SITE);
    expect(index).toContain('<loc>https://loja.example/sitemap/product-2.xml</loc>');
    expect(index).toContain('<sitemapindex');
  });

  it('parseSitemapFileName aceita so {segmento}-{n}.xml', () => {
    expect(parseSitemapFileName('product-1.xml')).toEqual({ segment: 'product', page: 1 });
    expect(parseSitemapFileName('long-tail-12.xml')).toEqual({ segment: 'long-tail', page: 12 });
    for (const bad of ['product-0.xml', 'product.xml', '../x-1.xml', 'product-1.xml.gz', 'Product-1.xml', 'product-01.xml']) expect(parseSitemapFileName(bad), bad).toBeNull();
  });
});

describe('politica de facetas', () => {
  const base = { basePath: '/dep', sort: 'relevance', defaultSort: 'relevance', page: 1 };

  it('sem faceta: canonical = colecao; pagina 2 tem canonical proprio, indexavel', () => {
    expect(decideFacetPolicy({ ...base, filters: {} })).toMatchObject({ canonicalPath: '/dep', indexable: true });
    expect(decideFacetPolicy({ ...base, filters: {}, page: 2 })).toMatchObject({ canonicalPath: '/dep?page=2', indexable: true, page: 2 });
  });

  it('uma faceta indexavel com um valor e indexavel e canonical de si mesma', () => {
    const d = decideFacetPolicy({ ...base, filters: { brand: ['marca-1'] } });
    expect(d).toMatchObject({ canonicalPath: '/dep?brand=marca-1', indexable: true });
    expect(d.robots).toBeUndefined();
    expect(decideFacetPolicy({ ...base, filters: { brand: ['marca-1'] }, page: 3 }).canonicalPath).toBe('/dep?brand=marca-1&page=3');
  });

  it('category isolada canonicaliza para a pagina de categoria; sem pagina, fica na propria URL', () => {
    expect(decideFacetPolicy({ ...base, filters: { category: ['cat'] }, categoryPaths: { cat: '/dep/cat' } }).canonicalPath).toBe('/dep/cat');
    expect(decideFacetPolicy({ ...base, filters: { category: ['outra'] }, categoryPaths: { cat: '/dep/cat' } }).canonicalPath).toBe('/dep?category=outra');
  });

  it('faceta combinada (duas facetas ou dois valores) e noindex,follow com canonical na colecao', () => {
    for (const filters of [{ brand: ['a'], category: ['b'] }, { brand: ['a', 'b'] }]) {
      expect(decideFacetPolicy({ ...base, filters, page: 2 })).toEqual({ canonicalPath: '/dep', robots: 'noindex,follow', indexable: false, page: 1 });
    }
  });

  it('price, sort e faceta nao indexavel nunca indexam', () => {
    expect(decideFacetPolicy({ ...base, filters: { price: ['ate-100'] } }).robots).toBe('noindex,follow');
    expect(decideFacetPolicy({ ...base, filters: {}, sort: 'price_asc' })).toMatchObject({ canonicalPath: '/dep', robots: 'noindex,follow' });
    expect(decideFacetPolicy({ ...base, filters: { cor: ['azul'] } }).robots).toBe('noindex,follow');
  });

  it('buildQuery e deterministica (ordenada) e ignora vazios', () => {
    expect(buildQuery({ page: '2', brand: 'x', sort: undefined })).toBe('?brand=x&page=2');
    expect(buildQuery({})).toBe('');
  });

  it('rel prev/next so em URL indexavel; pagina 1 volta sem ?page', () => {
    const mid = decideFacetPolicy({ ...base, filters: { brand: ['m'] }, page: 2 });
    expect(paginationLinks(mid, 3)).toEqual({ previous: '/dep?brand=m', next: '/dep?brand=m&page=3' });
    expect(paginationLinks(decideFacetPolicy({ ...base, filters: {}, page: 1 }), 1)).toEqual({});
    expect(paginationLinks(decideFacetPolicy({ ...base, filters: { price: ['x'] } }), 5)).toEqual({});
  });
});

describe('llms.txt', () => {
  it('traz nome, resumo, fatos da entidade, politicas com numeros e links absolutos', async () => {
    const [store, departments, productTypes, campaigns, pages] = await Promise.all([getStore(), getDepartments(), getProductTypes(), getCampaigns(), getPages()]);
    const txt = buildLlmsTxt({ site: SITE, store, departments, productTypes, campaigns, pages });
    expect(txt.startsWith(`# ${store.name}\n\n> ${store.organization.description}\n`)).toBe(true);
    expect(txt).toContain('fundada em 15/01/2020');
    expect(txt).toContain('grátis em compras a partir de R$');
    expect(txt).toContain('até 30 dias após o recebimento');
    expect(txt).toContain(`[Departamento exemplo](${SITE}/departamento-exemplo)`);
    expect(txt).toContain(`${SITE}/sitemap.xml`);
    expect(txt).toContain('de 01/01/2026 a 31/12/2099');
    expect(txt.endsWith('\n')).toBe(true);
  });
});

describe('atribuicao de trafego de IA', () => {
  const patterns = loadAllManifests().contracts.geo.attribution.referrerPatterns;

  it('classifica por referrer (dominio e subdominio) e por utm_source', async () => {
    const { classifyAiReferral } = await import('../lib/seo');
    expect(classifyAiReferral({ referrer: 'https://chatgpt.com/' }, patterns)).toBe('chatgpt.com');
    expect(classifyAiReferral({ referrer: 'https://www.perplexity.ai/search?q=x' }, patterns)).toBe('perplexity.ai');
    expect(classifyAiReferral({ referrer: '', utmSource: 'chatgpt.com' }, patterns)).toBe('chatgpt.com');
    expect(classifyAiReferral({ referrer: 'https://claude.ai/chat/1' }, patterns)).toBe('claude.ai');
  });

  it('nao confunde dominio parecido nem busca comum', async () => {
    const { classifyAiReferral } = await import('../lib/seo');
    expect(classifyAiReferral({ referrer: 'https://notchatgpt.com/' }, patterns)).toBeNull();
    expect(classifyAiReferral({ referrer: 'https://chatgpt.com.evil.example/' }, patterns)).toBeNull();
    expect(classifyAiReferral({ referrer: 'https://www.google.com/' }, patterns)).toBeNull();
    expect(classifyAiReferral({}, patterns)).toBeNull();
  });

  it('o script inline e pequeno, deterministico e se comporta como a funcao pura', async () => {
    const { aiReferralScript } = await import('../lib/seo');
    const script = aiReferralScript(patterns);
    expect(script).toBe(aiReferralScript(patterns));
    expect(script.length).toBeLessThan(1000);
    const run = (referrer: string, search: string) => {
      const dataLayer: unknown[] = [];
      const fakeWindow = { dataLayer } as { dataLayer: unknown[] };
      new Function('document', 'location', 'window', 'URL', 'URLSearchParams', script)({ referrer }, { search }, fakeWindow, URL, URLSearchParams);
      return dataLayer;
    };
    expect(run('https://chatgpt.com/', '')).toEqual([{ event: 'ai_referral', ai_source: 'chatgpt.com' }]);
    expect(run('', '?utm_source=perplexity.ai')).toEqual([{ event: 'ai_referral', ai_source: 'perplexity.ai' }]);
    expect(run('https://www.google.com/', '')).toEqual([]);
    expect(run('https://notchatgpt.com/', '')).toEqual([]);
  });
});
