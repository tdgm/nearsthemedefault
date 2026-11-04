import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchForm } from '../../components/search-form';
import { SearchStatus } from '../../components/search-status';
import { loadRoutes, vocab } from '../../lib/manifest';

// Busca: CSR/noindex no manifest (routes.manifest.yaml > search). O robots
// explicito aqui vale mesmo depois que o noindex global do layout sair (Fase 7).
export const metadata: Metadata = {
  title: vocab('search'),
  robots: { index: false, follow: false },
};

const MAX_QUERY_LENGTH = 100;

type SearchParams = Promise<{ q?: string | string[] }>;

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
  const { q } = await searchParams;
  const raw = Array.isArray(q) ? q[0] : q;
  const query = (raw ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  return (
    <>
      <SearchForm {...formProps()} defaultValue={query} />
      <SearchStatus
        query={query}
        labels={{
          empty: vocab('searchEmpty'),
          noResults: vocab('searchNoResults'),
          noResultsHint: vocab('searchNoResultsHint'),
        }}
      />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('search')}</h1>
      <Suspense fallback={<SearchForm {...formProps()} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
