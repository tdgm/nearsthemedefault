import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Badge, type BadgeTone, Link, Skeleton } from '@nears/ui';
import { findOrderByIdForCustomer, type OrderStatus } from '../../../../lib/data/orders';
import { formatBRL, formatDate } from '../../../../lib/format';
import { requireCustomer } from '../../../../lib/auth/guard';
import { vocab } from '../../../../lib/manifest';
import { buildMetadata } from '../../../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    template: 'account-pedido-detalhe',
    title: vocab('accountPedidoDetalheTitle'),
    description: vocab('accountPedidoDetalheTitle'),
    path: '/account/pedidos',
    robots: 'noindex,nofollow',
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

type Params = Promise<{ orderId: string }>;

/**
 * `params` (como `searchParams`/`cookies()`) e dado de requisicao: fica dentro
 * do Suspense, nunca lido no topo da pagina (ADR 0007). `findOrderByIdForCustomer`
 * so retorna o pedido quando ele pertence ao cliente autenticado - `notFound()`
 * cobre tanto "pedido inexistente" quanto "pedido de outro cliente", sem
 * distinguir a resposta (evita confirmar que um id de outro cliente existe).
 */
async function AccountPedidoDetalhe({ params }: { params: Params }) {
  const { orderId } = await params;
  const customer = await requireCustomer(`/account/pedidos/${orderId}`);
  const order = await findOrderByIdForCustomer(orderId, customer.id);
  if (!order) notFound();

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge tone={STATUS_TONE[order.status]}>{vocab(STATUS_LABEL[order.status])}</Badge>
        <span className="text-sm text-on-surface-muted">
          {vocab('accountPedidoPlacedAt')} {formatDate(order.placedAt)}
        </span>
      </div>
      <h2 className="mb-2 text-lg font-semibold">{vocab('accountPedidoItens')}</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-control">
            <th scope="col" className="py-2 pr-2">
              {vocab('accountPedidoItemName')}
            </th>
            <th scope="col" className="py-2 pr-2 text-right">
              {vocab('accountPedidoQuantity')}
            </th>
            <th scope="col" className="py-2 text-right">
              {vocab('accountPedidoSubtotal')}
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.sku} className="border-b border-border-control last:border-0">
              <td className="py-2 pr-2">
                {item.name}
                <span className="block text-xs text-on-surface-muted">{item.sku}</span>
              </td>
              <td className="py-2 pr-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatBRL(item.unitPrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 ml-auto w-fit space-y-1 text-sm">
        <div className="flex gap-4">
          <dt className="text-on-surface-muted">{vocab('accountPedidoSubtotal')}</dt>
          <dd className="ml-auto font-medium">{formatBRL(order.subtotal)}</dd>
        </div>
        <div className="flex gap-4">
          <dt className="text-on-surface-muted">{vocab('accountPedidoTotal')}</dt>
          <dd className="ml-auto font-bold">{formatBRL(order.total)}</dd>
        </div>
      </dl>
    </>
  );
}

export default function Page({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountPedidoDetalheTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-40 w-full" label={vocab('accountLoading')} />}>
        <AccountPedidoDetalhe params={params} />
      </Suspense>
      <p className="mt-6">
        <Link href="/account/pedidos">{vocab('accountPedidoVoltar')}</Link>
      </p>
    </main>
  );
}
