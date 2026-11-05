import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductGrid } from '@nears/sections';
import { SearchForm } from '../../components/search-form';
import { SearchStatus } from '../../components/search-status';
import { parseCollectionQuery, searchProducts } from '../../lib/data/collections';
import { cardAspect, toProductCard } from '../../lib/data/mappers';
import { loadConfig, loadRoutes, vocab } from '../../lib/manifest';
import { buildMetadata } from '../../lib/seo';

// Busca: noindex,nofollow vem de contracts.yaml > seo.byTemplate.search (e o
// /s sai do robots.txt). Canonical sem query: a busca nunca indexa termos.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ template: 'search', title: vocab('search'), description: vocab('searchEmpty'), path: '/s' });
}

const MAX_QUERY_LENGTH = 100;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formProps() {
  const route = loadRoutes().find((r) => r.id === 'search');
  return {
    action: route?.pattern ?? '/s',
    label: vocab('searchLabel'),
    placeholder: vocab('searchPlaceholder'),
    submit: vocab('searchSubmit'),
  };
}

// searchParams e dado de requisicao: com cacheComponents precisa ficar dentro
// de Suspense. O shell (H1 + formulario vazio) sai no HTML estatico.
async function Results({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { q } = params;
  const raw = Array.isArray(q) ? q[0] : q;
  const query = (raw ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const { sort, page, pageSize } = parseCollectionQuery(params, [], 24);
  const found = query ? await searchProducts(query, { sort, page, pageSize }) : null;
  const aspect = cardAspect(loadConfig());

  return (
    <>
      <SearchForm {...formProps()} defaultValue={query} />
      {found && found.total > 0 ? (
        <ProductGrid
          pageSize={pageSize}
          products={found.products.map((p) => toProductCard(p, { aspect }))}
          total={found.total}
          page={found.page}
          basePath="/s"
          query={{ q: query, ...(sort !== 'relevance' ? { sort } : {}) }}
          currentSort={sort}
        />
      ) : (
        <SearchStatus
          query={query}
          labels={{
            empty: vocab('searchEmpty'),
            noResults: vocab('searchNoResults'),
            noResultsHint: vocab('searchNoResultsHint'),
          }}
        />
      )}
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('search')}</h1>
      <Suspense fallback={<SearchForm {...formProps()} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
