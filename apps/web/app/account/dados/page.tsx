import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Link, Skeleton } from '@nears/ui';
import { formatDate } from '../../../lib/format';
import { requireCustomer } from '../../../lib/auth/guard';
import { vocab } from '../../../lib/manifest';
import { buildMetadata } from '../../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ template: 'account-dados', title: vocab('accountDadosTitle'), description: vocab('accountDadosTitle'), path: '/account/dados' });
}

/** Mesmo padrao de `requireCustomer` em `app/account/page.tsx`: cookie lido dentro do Suspense. */
async function AccountDados() {
  const customer = await requireCustomer('/account/dados');
  const notInformed = vocab('accountDadosNotInformed');

  const fields: Array<[string, string]> = [
    [vocab('accountDadosName'), customer.name],
    [vocab('accountDadosEmail'), customer.email],
    [vocab('accountDadosPhone'), customer.phone ?? notInformed],
    [vocab('accountDadosCpf'), customer.cpf ?? notInformed],
    // birthDate e so data (YYYY-MM-DD): soma meio-dia antes de formatar para nao
    // cruzar meia-noite UTC e exibir o dia anterior em America/Sao_Paulo (mesmo
    // truque de apps/web/lib/seo/llms.ts > foundingDate).
    [vocab('accountDadosBirthDate'), customer.birthDate ? formatDate(`${customer.birthDate}T12:00:00`) : notInformed],
  ];

  return (
    <dl className="divide-y divide-border-control">
      {fields.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-on-surface-muted">{label}</dt>
          <dd className="text-on-surface">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-heading">{vocab('accountDadosTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-40 w-full" label={vocab('accountLoading')} />}>
        <AccountDados />
      </Suspense>
      <p className="mt-6">
        <Link href="/account">{vocab('accountBackToOverview')}</Link>
      </p>
    </main>
  );
}
