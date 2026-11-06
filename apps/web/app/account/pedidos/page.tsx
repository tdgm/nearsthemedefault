import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Badge, type BadgeTone, Link, Skeleton } from '@nears/ui';
import { findOrdersByCustomerId, type OrderStatus } from '../../../lib/data/orders';
import { formatBRL, formatDate } from '../../../lib/format';
import { requireCustomer } from '../../../lib/auth/guard';
import { vocab } from '../../../lib/manifest';
import { buildMetadata } from '../../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    template: 'account-pedidos',
    title: vocab('accountPedidosTitle'),
    description: vocab('accountPedidosTitle'),
    path: '/account/pedidos',
  });
}

const STATUS_LABEL: Record<OrderStatus, 'accountPedidosStatusPlaced' | 'accountPedidosStatusProcessing' | 'accountPedidosStatusInTransit' | 'accountPedidosStatusDelivered' | 'accountPedidosStatusCanceled'> = {
  placed: 'accountPedidosStatusPlaced',
  processing: 'accountPedidosStatusProcessing',
  inTransit: 'accountPedidosStatusInTransit',
  delivered: 'accountPedidosStatusDelivered',
  canceled: 'accountPedidosStatusCanceled',
};

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  placed: 'info',
  processing: 'warning',
  inTransit: 'info',
  delivered: 'success',
  canceled: 'danger',
};

/** Mesmo padrao de `requireCustomer` em `app/account/page.tsx`: cookie lido dentro do Suspense. */
async function AccountPedidos() {
  const customer = await requireCustomer('/account/pedidos');
  const orders = await findOrdersByCustomerId(customer.id);

  if (orders.length === 0) {
    return <p className="text-on-surface-muted">{vocab('accountPedidosEmpty')}</p>;
  }

  return (
    <ul className="divide-y divide-border-control">
      {orders.map((order) => (
        <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-medium text-on-surface">{order.id}</p>
            <p className="text-sm text-on-surface-muted">
              {formatDate(order.placedAt)} · {formatBRL(order.total)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[order.status]}>{vocab(STATUS_LABEL[order.status])}</Badge>
            <Link href={`/account/pedidos/${order.id}`}>{vocab('accountPedidosViewDetail')}</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountPedidosTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-40 w-full" label={vocab('accountLoading')} />}>
        <AccountPedidos />
      </Suspense>
      <p className="mt-6">
        <Link href="/account">{vocab('accountBackToOverview')}</Link>
      </p>
    </main>
  );
}
