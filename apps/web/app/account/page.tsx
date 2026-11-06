import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Button, Link, Skeleton } from '@nears/ui';
import { requireCustomer } from '../../lib/auth/guard';
import { vocab } from '../../lib/manifest';
import { buildMetadata } from '../../lib/seo';

// Visao geral da conta (Fase 9c, ADR 0027): sempre noindex,nofollow - dado
// pessoal, nunca conteudo de catalogo a citar/indexar.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ template: 'account', title: vocab('accountOverviewTitle'), description: vocab('accountOverviewTitle'), path: '/account' });
}

const NAV = [
  { href: '/account/dados', label: 'accountNavDados' as const },
  { href: '/account/enderecos', label: 'accountNavEnderecos' as const },
  { href: '/account/pedidos', label: 'accountNavPedidos' as const },
  { href: '/account/favoritos', label: 'accountNavFavoritos' as const },
];

/**
 * `requireCustomer` le `cookies()` - com Cache Components (ADR 0007) isso
 * precisa ficar dentro de `<Suspense>`, senao o build falha ao tentar
 * prerenderizar a rota (mesmo padrao de `app/login/page.tsx`). O shell
 * estatico e so o `<h1>`; todo o resto e pessoal e fica na ilha dinamica.
 */
async function AccountOverview() {
  const customer = await requireCustomer('/account');

  return (
    <>
      <p className="mb-6 text-on-surface-muted">
        {vocab('accountGreeting')} <span className="font-medium text-on-surface">{customer.name}</span>
      </p>
      <nav aria-label={vocab('accountOverviewTitle')}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md border border-border-control p-4 text-on-surface hover:bg-surface-subtle"
              >
                {vocab(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action="/api/account/session/logout" method="POST" className="mt-6">
        <Button type="submit" variant="secondary" size="sm">
          {vocab('accountLogout')}
        </Button>
      </form>
    </>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountOverviewTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-48 w-full" label={vocab('accountLoading')} />}>
        <AccountOverview />
      </Suspense>
    </main>
  );
}
