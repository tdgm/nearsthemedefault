import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Link, Skeleton } from '@nears/ui';
import { ProductGrid } from '@nears/sections';
import { getProducts } from '../../../lib/data/client';
import { findFavoritesByCustomerId } from '../../../lib/data/favorites';
import { cardAspect, toProductCard } from '../../../lib/data/mappers';
import { requireCustomer } from '../../../lib/auth/guard';
import { loadConfig, vocab } from '../../../lib/manifest';
import { buildMetadata } from '../../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    template: 'account-favoritos',
    title: vocab('accountFavoritosTitle'),
    description: vocab('accountFavoritosTitle'),
    path: '/account/favoritos',
  });
}

/** Mesmo padrao de `requireCustomer` em `app/account/page.tsx`: cookie lido dentro do Suspense. */
async function AccountFavoritos() {
  const customer = await requireCustomer('/account/favoritos');
  const [favorites, products] = await Promise.all([findFavoritesByCustomerId(customer.id), getProducts()]);
  const favoriteProducts = favorites
    .map((favorite) => products.find((p) => p.sku === favorite.sku))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (favoriteProducts.length === 0) {
    return <p className="text-on-surface-muted">{vocab('accountFavoritosEmpty')}</p>;
  }

  const aspect = cardAspect(loadConfig());
  return (
    <ProductGrid
      pageSize={Math.max(favoriteProducts.length, 1)}
      products={favoriteProducts.map((p) => toProductCard(p, { aspect }))}
      total={favoriteProducts.length}
      page={1}
      basePath="/account/favoritos"
      sort={['relevance']}
      labels={{ heading: vocab('accountFavoritosTitle') }}
    />
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountFavoritosTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-48 w-full" label={vocab('accountLoading')} />}>
        <AccountFavoritos />
      </Suspense>
      <p className="mt-6">
        <Link href="/account">{vocab('accountBackToOverview')}</Link>
      </p>
    </main>
  );
}
