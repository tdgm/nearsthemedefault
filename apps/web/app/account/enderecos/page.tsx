import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Badge, Link, Skeleton } from '@nears/ui';
import { formatCEP } from '../../../lib/format';
import { requireCustomer } from '../../../lib/auth/guard';
import { vocab } from '../../../lib/manifest';
import { buildMetadata } from '../../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    template: 'account-enderecos',
    title: vocab('accountEnderecosTitle'),
    description: vocab('accountEnderecosTitle'),
    path: '/account/enderecos',
  });
}

/** Mesmo padrao de `requireCustomer` em `app/account/page.tsx`: cookie lido dentro do Suspense. */
async function AccountEnderecos() {
  const customer = await requireCustomer('/account/enderecos');

  if (customer.addresses.length === 0) {
    return <p className="text-on-surface-muted">{vocab('accountEnderecosEmpty')}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {customer.addresses.map((address) => (
        <li key={address.id} className="rounded-md border border-border-control p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-medium text-on-surface">{address.label}</span>
            {address.isDefault && <Badge tone="info">{vocab('accountEnderecosDefault')}</Badge>}
          </div>
          <p className="text-sm text-on-surface-muted">
            {address.recipient}
            <br />
            {address.street}, {address.number}
            {address.complement ? ` - ${address.complement}` : ''}
            <br />
            {address.neighborhood} - {address.city}/{address.state}
            <br />
            CEP {formatCEP(address.postalCode)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountEnderecosTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-40 w-full" label={vocab('accountLoading')} />}>
        <AccountEnderecos />
      </Suspense>
      <p className="mt-6">
        <Link href="/account">{vocab('accountBackToOverview')}</Link>
      </p>
    </main>
  );
}
