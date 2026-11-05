// sitemap.xml segmentado (routes.manifest.yaml > sitemapXml). O indice lista um
// arquivo por segmento e por bloco de `maxUrlsPerFile`; cada arquivo e um urlset.
// Segmento vazio nao aparece no indice. Nada de `lastmod` inventado: so entra
// quando o dado informa (o Google ignora lastmod que nao reflete mudanca real).
import { getCampaigns, getDepartments, getLongtails, getPages, getProductTypes, getProducts } from '../data/client';
import { loadAllManifests } from '../manifest';
import { isCampaignActive } from '../routing/resolve';
import { indexableFacetEntries } from './facets';
import { absoluteUrl } from './site';

export type SitemapEntry = { path: string; lastmod?: string };
export type SitemapSegments = Record<string, SitemapEntry[]>;
export type SitemapFile = { segment: string; page: number; entries: SitemapEntry[] };

/** Um coletor por nome em `sitemapXml.segments`. Nome sem coletor falha alto. */
async function collectors(now: Date): Promise<Record<string, () => Promise<SitemapEntry[]>>> {
  const { config } = loadAllManifests();
  return {
    product: async () => (await getProducts()).map((p) => ({ path: `/${p.slug}/p` })),
    category: async () => {
      const [departments, types] = await Promise.all([getDepartments(), getProductTypes()]);
      return [
        ...departments.flatMap((d) => [
          { path: `/${d.slug}` },
          ...d.categories.flatMap((c) => [{ path: `/${d.slug}/${c.slug}` }, ...c.subcategories.map((s) => ({ path: `/${d.slug}/${c.slug}/${s.slug}` }))]),
        ]),
        ...(config.catalog.flatAxis.enabled ? types.map((t) => ({ path: `/${t.slug}` })) : []),
      ];
    },
    longtail: async () => (await getLongtails()).map((l) => ({ path: `/b/${l.keyword}` })),
    campaign: async () =>
      (await getCampaigns())
        .filter((c) => isCampaignActive(c, now)) // fora da janela a rota redireciona: nao vai ao sitemap
        .flatMap((c) => [{ path: `/${c.slug}` }, ...c.segments.map((s) => ({ path: `/${c.slug}/${s.slug}` }))]),
    page: async () => [{ path: '/' }, { path: '/mapa-do-site' }, ...(await getPages()).map((p) => ({ path: `/${p.slug}` }))],
    // Facetas indexaveis (catalog.facets.indexable): preenchido pela politica de facetas.
    brand: () => indexableFacetEntries(),
  };
}

export async function collectSitemapEntries(now: Date): Promise<SitemapSegments> {
  const wanted = loadAllManifests().routes.sitemapXml.segments;
  const available = await collectors(now);
  const out: SitemapSegments = {};
  for (const segment of wanted) {
    const collect = available[segment];
    if (!collect) throw new Error(`sitemapXml.segments: "${segment}" nao tem coletor (lib/seo/sitemap.ts)`);
    out[segment] = dedupe(await collect());
  }
  return out;
}

const dedupe = (entries: SitemapEntry[]) => [...new Map(entries.map((e) => [e.path, e])).values()];

export function chunk<T>(list: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Arquivos do sitemap: `{segmento}-{n}.xml` (n a partir de 1), sem segmentos vazios. */
export function sitemapFiles(segments: SitemapSegments, maxUrlsPerFile: number): SitemapFile[] {
  return Object.entries(segments).flatMap(([segment, entries]) => chunk(entries, maxUrlsPerFile).map((part, i) => ({ segment, page: i + 1, entries: part })));
}

export const sitemapFileName = (f: Pick<SitemapFile, 'segment' | 'page'>) => `${f.segment}-${f.page}.xml`;

/** `product-2.xml` -> { segment: 'product', page: 2 }; qualquer outra coisa -> null. */
export function parseSitemapFileName(name: string): { segment: string; page: number } | null {
  const m = /^([a-z]+(?:-[a-z]+)*)-([1-9]\d*)\.xml$/.exec(name);
  return m ? { segment: m[1]!, page: Number(m[2]) } : null;
}

const escapeXml = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';

export function renderUrlset(entries: SitemapEntry[], site: string): string {
  const urls = entries.map((e) => `  <url><loc>${escapeXml(absoluteUrl(e.path, site))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`);
  return `${XML_HEAD}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function renderSitemapIndex(files: Pick<SitemapFile, 'segment' | 'page'>[], site: string): string {
  const items = files.map((f) => `  <sitemap><loc>${escapeXml(absoluteUrl(`/sitemap/${sitemapFileName(f)}`, site))}</loc></sitemap>`);
  return `${XML_HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`;
}

/** Cabecalhos de cache: CDN guarda 1h e serve velho enquanto revalida (catalogo muda devagar). */
export const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const;
