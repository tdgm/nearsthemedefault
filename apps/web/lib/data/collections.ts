// Consulta de produtos de uma colecao: escopo (departamento, categoria, tipo...),
// facetas, ordenacao e paginacao. O mock faz em memoria; com o backend GraphQL
// a mesma assinatura vira uma query (o contrato de retorno nao muda).
import { getProducts } from './client';
import type { Product } from './schemas';

export type ProductScope = Partial<Pick<Product, 'department' | 'category' | 'subcategory' | 'productType' | 'brand'>>;

export type CollectionQuery = {
  /** faceta -> valores selecionados */
  filters: Record<string, string[]>;
  sort: string;
  page: number;
  pageSize: number;
};

export type FacetOption = { value: string; label: string; count: number };
export type Facet = { id: string; label: string; options: FacetOption[] };

export type CollectionResult = {
  products: Product[];
  total: number;
  facets: Facet[];
  page: number;
  pageCount: number;
};

export const DEFAULT_SORT = 'relevance';
export const SORTS = ['relevance', 'price_asc', 'price_desc', 'newest', 'discount'] as const;

const PRICE_RANGES = [
  { value: 'ate-100', label: 'Até R$ 100', test: (p: Product) => p.price <= 100 },
  { value: '100-200', label: 'De R$ 100 a R$ 200', test: (p: Product) => p.price > 100 && p.price <= 200 },
  { value: 'acima-200', label: 'Acima de R$ 200', test: (p: Product) => p.price > 200 },
] as const;

const slugify = (v: string) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Valor da faceta em um produto (uma faceta pode ter varios valores no futuro). */
function facetValues(p: Product, facet: string): string[] {
  if (facet === 'category') return [p.category];
  if (facet === 'brand') return p.brand ? [slugify(p.brand)] : [];
  if (facet === 'price') return PRICE_RANGES.filter((r) => r.test(p)).map((r) => r.value);
  // Faceta de eixo de variacao (cor, tamanho, voltagem...): vale o que o produto oferece.
  return p.variants.find((v) => v.axis === facet)?.options.map((o) => o.value) ?? [];
}

function facetLabel(p: Product, facet: string, value: string): string {
  if (facet === 'brand') return p.brand ?? value;
  if (facet === 'price') return PRICE_RANGES.find((r) => r.value === value)?.label ?? value;
  return p.variants.find((v) => v.axis === facet)?.options.find((o) => o.value === value)?.label ?? value;
}

const discount = (p: Product) => (p.listPrice && p.listPrice > p.price ? (p.listPrice - p.price) / p.listPrice : 0);

function sortProducts(list: Product[], sort: string): Product[] {
  const out = [...list];
  switch (sort) {
    case 'price_asc':
      return out.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return out.sort((a, b) => b.price - a.price);
    case 'newest':
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'discount':
      return out.sort((a, b) => discount(b) - discount(a));
    default:
      return out;
  }
}

export async function queryCollection(
  scope: ProductScope,
  query: CollectionQuery,
  availableFacets: readonly string[],
  facetLabels: Readonly<Record<string, string>> = {},
): Promise<CollectionResult> {
  const inScope = (await getProducts()).filter((p) =>
    (Object.entries(scope) as [keyof ProductScope, string | undefined][]).every(([k, v]) => v === undefined || p[k] === v),
  );

  const facets: Facet[] = availableFacets.map((id) => {
    const counts = new Map<string, FacetOption>();
    for (const p of inScope) {
      for (const value of facetValues(p, id)) {
        const cur = counts.get(value);
        counts.set(value, { value, label: facetLabel(p, id, value), count: (cur?.count ?? 0) + 1 });
      }
    }
    return { id, label: facetLabels[id] ?? id, options: [...counts.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')) };
  });

  const filtered = inScope.filter((p) =>
    Object.entries(query.filters).every(([facet, wanted]) => wanted.length === 0 || facetValues(p, facet).some((v) => wanted.includes(v))),
  );

  const sorted = sortProducts(filtered, query.sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  return {
    products: sorted.slice((page - 1) * query.pageSize, page * query.pageSize),
    total: sorted.length,
    facets,
    page,
    pageCount,
  };
}

/** Texto de busca simples (nome, marca): nome contem todos os termos. */
export async function searchProducts(term: string, query: Pick<CollectionQuery, 'sort' | 'page' | 'pageSize'>) {
  const terms = slugify(term).split('-').filter(Boolean);
  const all = await getProducts();
  const hit = all.filter((p) => {
    const hay = slugify(`${p.name} ${p.brand ?? ''}`);
    return terms.length > 0 && terms.every((t) => hay.includes(t));
  });
  const sorted = sortProducts(hit, query.sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  return { products: sorted.slice((page - 1) * query.pageSize, page * query.pageSize), total: sorted.length, page, pageCount };
}

/** Le `?sort=&page=&faceta=valor` (valores repetidos viram lista) com limites seguros. */
export function parseCollectionQuery(
  raw: Record<string, string | string[] | undefined>,
  facetIds: readonly string[],
  pageSize: number,
): CollectionQuery {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const sortRaw = first(raw.sort);
  const sort = SORTS.includes(sortRaw as (typeof SORTS)[number]) ? (sortRaw as string) : DEFAULT_SORT;
  const pageNum = Number.parseInt(first(raw.page) ?? '1', 10);
  const filters: Record<string, string[]> = {};
  for (const id of facetIds) {
    const v = raw[id];
    const list = (Array.isArray(v) ? v : v ? [v] : []).map((x) => x.slice(0, 60)).filter(Boolean).slice(0, 10);
    if (list.length) filters[id] = list;
  }
  return { filters, sort, page: Number.isFinite(pageNum) && pageNum > 0 ? Math.min(pageNum, 1000) : 1, pageSize };
}
