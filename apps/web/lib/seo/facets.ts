// Politica de indexacao de facetas e paginacao (routes.manifest.yaml > canonical e
// facets; docs/adr/0021). Funcao pura: recebe a URL ja interpretada e devolve
// canonical + robots. Regras, nesta ordem:
//   1. sort fora do padrao, faceta em `neverIndexable` (price...) ou fora de
//      `catalog.facets.indexable`            -> noindex,follow; canonical = colecao sem query
//   2. mais de uma faceta ou de um valor      -> noindex,follow; canonical = colecao sem query
//      (`indexableAlone`: so indexa uma faceta aplicada isoladamente)
//   3. uma faceta indexavel com um valor      -> indexavel; canonical = ela mesma
//      (a faceta `category` canonicaliza para a pagina de categoria, se houver)
//   4. sem faceta                             -> canonical = colecao
//   `page` > 1 so entra no canonical de URL indexavel (`pagination.strategy: indexable-urls`).
import { getDepartments, getProductTypes } from '../data/client';
import { queryCollection } from '../data/collections';
import { loadAllManifests } from '../manifest';
import type { Manifests } from '@nears/manifests';
import type { SitemapEntry } from './sitemap';

type Rules = Pick<Manifests, 'config' | 'routes'>;

export type FacetInput = {
  basePath: string;
  /** Filtros aplicados pelo usuario na URL (nao os pre-aplicados da landing). */
  filters: Record<string, string[]>;
  sort: string;
  defaultSort: string;
  page: number;
  /** Para a faceta `category`: pagina de categoria equivalente (ex.: /dep/cat), se existir. */
  categoryPaths?: Record<string, string>;
};

export type FacetDecision = {
  canonicalPath: string;
  /** Undefined = robots padrao do template. */
  robots?: string;
  indexable: boolean;
  /** `page` aplicado ao canonical (1 quando a URL nao e paginavel). */
  page: number;
};

const NOINDEX_FOLLOW = 'noindex,follow';

/** Query string deterministica (chaves ordenadas): a mesma pagina nunca tem duas grafias. */
export function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params)
    .filter((e): e is [string, string] => e[1] !== undefined && e[1] !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.length ? `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
}

export function decideFacetPolicy(input: FacetInput, { config, routes }: Rules = loadAllManifests()): FacetDecision {
  const { basePath } = input;
  const active = Object.entries(input.filters).filter(([, values]) => values.length > 0);
  const never = new Set(routes.facets.neverIndexable);
  const indexable = new Set(config.catalog.facets.indexable);
  const noindex: FacetDecision = { canonicalPath: basePath, robots: NOINDEX_FOLLOW, indexable: false, page: 1 };
  const pageParam = input.page > 1 ? String(input.page) : undefined;

  if (input.sort !== input.defaultSort && never.has('sort')) return noindex;
  if (active.some(([id]) => never.has(id) || !indexable.has(id))) return noindex;
  const total = active.reduce((n, [, values]) => n + values.length, 0);
  if (total > 1 && routes.facets.indexableAlone) return noindex;

  const only = active[0];
  if (!only) return { canonicalPath: `${basePath}${buildQuery({ page: pageParam })}`, indexable: true, page: input.page };

  const [id, [value]] = only as [string, [string]];
  const categoryPath = id === 'category' ? input.categoryPaths?.[value] : undefined;
  if (categoryPath) return { canonicalPath: `${categoryPath}${buildQuery({ page: pageParam })}`, indexable: true, page: input.page };
  return { canonicalPath: `${basePath}${buildQuery({ [id]: value, page: pageParam })}`, indexable: true, page: input.page };
}

/** rel prev/next so em URL indexavel; a pagina 1 volta para a URL sem `page`. */
export function paginationLinks(
  decision: FacetDecision,
  pageCount: number,
): { previous?: string; next?: string } {
  if (!decision.indexable) return {};
  const [path, query = ''] = decision.canonicalPath.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  const at = (page: number) => `${path}${buildQuery({ ...params, page: page > 1 ? String(page) : undefined })}`;
  return {
    ...(decision.page > 1 ? { previous: at(decision.page - 1) } : {}),
    ...(decision.page < pageCount ? { next: at(decision.page + 1) } : {}),
  };
}

/**
 * Entradas do sitemap para facetas indexaveis aplicadas isoladamente (segmento
 * `brand`). A faceta `category` fica de fora: ja tem pagina propria no eixo de
 * departamento (canonical para ela).
 */
export async function indexableFacetEntries(): Promise<SitemapEntry[]> {
  const { config } = loadAllManifests();
  const facetIds = config.catalog.facets.indexable.filter((id) => id !== 'category' && config.catalog.facets.available.includes(id));
  if (facetIds.length === 0) return [];
  const [departments, types] = await Promise.all([getDepartments(), getProductTypes()]);
  const bases = [
    ...departments.map((d) => ({ path: `/${d.slug}`, scope: { department: d.slug } })),
    ...(config.catalog.flatAxis.enabled ? types.map((t) => ({ path: `/${t.slug}`, scope: { productType: t.slug } })) : []),
  ];
  const entries: SitemapEntry[] = [];
  for (const base of bases) {
    const result = await queryCollection(base.scope, { filters: {}, sort: 'relevance', page: 1, pageSize: 1 }, facetIds);
    for (const facet of result.facets) {
      for (const option of facet.options) entries.push({ path: `${base.path}${buildQuery({ [facet.id]: option.value })}` });
    }
  }
  return entries;
}
