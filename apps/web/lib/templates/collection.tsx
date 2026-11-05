import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { getDepartments } from '../data/client';
import { cardAspect, toProductCard } from '../data/mappers';
import { DEFAULT_SORT, parseCollectionQuery, queryCollection, type CollectionQuery } from '../data/collections';
import { loadAllManifests, loadConfig } from '../manifest';
import { JsonLdScript, breadcrumbNode, buildMetadata, collectionPageNode, decideFacetPolicy, faqNode, getSeoContext, graph, itemListNode, organizationNode, paginationLinks } from '../seo';
import { buildCollectionView, facetLabels, type CollectionView } from './collection-content';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

const PAGE_SIZE = 24;

type RawQuery = Record<string, string | string[] | undefined>;

const emptyQuery = (): CollectionQuery => ({ filters: {}, sort: DEFAULT_SORT, page: 1, pageSize: PAGE_SIZE });

/**
 * Metadata da colecao. Canonical e robots seguem a politica de facetas e paginacao
 * (lib/seo/facets, docs/adr/0021): faceta/ordenacao fora da regra vira noindex,follow
 * com canonical na colecao; pagina > 1 indexavel ganha canonical proprio e rel prev/next.
 */
export async function collectionMetadata(view: CollectionView, raw: RawQuery = {}): Promise<Metadata> {
  const config = loadConfig();
  const query = parseCollectionQuery(raw, config.catalog.facets.available, PAGE_SIZE);
  const departments = await getDepartments();
  const department = view.scope.category ? undefined : departments.find((d) => d.slug === view.scope.department);
  const categoryPaths = department ? Object.fromEntries(department.categories.map((c) => [c.slug, `/${department.slug}/${c.slug}`])) : undefined;
  // Pagina real (clampada) para o canonical e o prev/next: depende do total de produtos.
  const merged: CollectionQuery = { ...query, filters: { ...view.presetFilters, ...query.filters } };
  const { pageCount, page } = await queryCollection(view.scope, merged, config.catalog.facets.available, facetLabels());
  const decision = decideFacetPolicy({
    basePath: view.basePath,
    filters: query.filters,
    sort: query.sort,
    defaultSort: DEFAULT_SORT,
    page,
    ...(categoryPaths ? { categoryPaths } : {}),
  });
  return buildMetadata({
    template: view.template,
    title: view.title,
    description: view.intro,
    path: decision.canonicalPath,
    ...(decision.robots ? { robots: decision.robots } : {}),
    pagination: paginationLinks(decision, pageCount),
  });
}

async function CollectionBody({ view, query }: { view: CollectionView; query: CollectionQuery }) {
  const { config, sections } = loadAllManifests();
  const facetIds = config.catalog.facets.available;
  const merged: CollectionQuery = { ...query, filters: { ...view.presetFilters, ...query.filters } };
  const result = await queryCollection(view.scope, merged, facetIds, facetLabels());
  const aspect = cardAspect(config);
  const instances = expandTemplate(sections.templates.collection?.sections ?? [], {});

  // Chips rapidos: as opcoes da primeira faceta indexavel (catalog.facets.indexable).
  const chipFacet = result.facets.find((f) => config.catalog.facets.indexable.includes(f.id));
  const current: Record<string, string> = Object.fromEntries(Object.entries(query.filters).map(([k, v]) => [k, v[0] ?? '']));

  const propsFor = (inst: { id: string }): unknown | null => {
    switch (inst.id) {
      case 'breadcrumb':
        return { items: view.breadcrumb };
      case 'section-title':
        return { text: view.title, level: 'h1' };
      case 'quick-filter':
        return chipFacet && chipFacet.options.length > 0
          ? { chips: chipFacet.options.slice(0, 8).map((o) => ({ label: o.label, facet: chipFacet.id, value: o.value })), basePath: view.basePath, current }
          : null;
      case 'product-grid':
        return {
          pageSize: PAGE_SIZE,
          facets: facetIds,
          products: result.products.map((p) => toProductCard(p, { aspect })),
          total: result.total,
          page: result.page,
          basePath: view.basePath,
          query: { ...Object.fromEntries(Object.entries(query.filters)), ...(query.sort !== DEFAULT_SORT ? { sort: query.sort } : {}) },
          currentSort: query.sort,
          filters: result.facets.map((f) => ({ id: f.id, label: f.label, options: f.options })),
        };
      case 'text-seo':
        return { title: `O que você encontra em ${view.title}?`, richText: view.intro };
      case 'faq':
        return { title: 'Perguntas frequentes', items: view.faq };
      case 'related-links':
        return view.related.length ? { title: 'Continue explorando', links: view.related } : null;
      default:
        return null; // event-banner etc.: entram quando o CMS enviar conteudo
    }
  };

  // JSON-LD no HTML inicial: BreadcrumbList + CollectionPage com ItemList da pagina + FAQPage.
  const ctx = await getSeoContext();
  const items = result.products.map((p) => ({ name: p.name, path: `/${p.slug}/p` }));
  const data = graph(
    organizationNode(ctx),
    collectionPageNode(ctx, {
      name: view.title,
      description: view.intro,
      path: view.basePath,
      breadcrumb: breadcrumbNode(view.breadcrumb, view.basePath, ctx.site),
      mainEntity: itemListNode(items, ctx.site),
    }),
    faqNode(view.faq),
  );

  return (
    <>
      <JsonLdScript data={data} />
      {renderInstances(instances, propsFor)}
    </>
  );
}

async function DynamicBody({ view, searchParams }: { view: CollectionView; searchParams: Promise<RawQuery> }) {
  const raw = await searchParams;
  const query = parseCollectionQuery(raw, loadConfig().catalog.facets.available, PAGE_SIZE);
  return <CollectionBody view={view} query={query} />;
}

/**
 * Pagina de colecao. O shell estatico traz a colecao SEM filtros (pagina 1,
 * ordenacao padrao): e o que crawlers e usuarios sem JS recebem. Com
 * `cacheComponents`, ler a URL (?page, ?sort, filtros) so e permitido dentro de
 * Suspense; ali o resultado filtrado substitui o shell (docs/adr/0018).
 */
export async function CollectionPage({
  resolved,
  searchParams,
}: {
  resolved: Parameters<typeof buildCollectionView>[0];
  searchParams: Promise<RawQuery>;
}): Promise<ReactNode> {
  const view = await buildCollectionView(resolved);
  return (
    <main>
      <Suspense fallback={<CollectionBody view={view} query={emptyQuery()} />}>
        <DynamicBody view={view} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

export { buildCollectionView };
