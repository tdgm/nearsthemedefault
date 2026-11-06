// Pedidos mock (Fase 9c, ADR 0027). Espelha `contracts.yaml > data.order`. So
// existe para exercitar `/account/pedidos` (lista) e
// `/account/pedidos/[orderId]` (detalhe) - este repo e frontend puro, sem
// backend de pedidos real.
import { z } from 'zod';

export const orderItemSchema = z.strictObject({
  sku: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
});

export const orderStatusSchema = z.enum(['placed', 'processing', 'inTransit', 'delivered', 'canceled']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderSchema = z.strictObject({
  id: z.string().min(1),
  placedAt: z.iso.datetime({ offset: true }),
  status: orderStatusSchema,
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().positive(),
  total: z.number().positive(),
});
export type Order = z.infer<typeof orderSchema>;

type CustomerOrder = { customerId: string; order: Order };

/**
 * `items[].name`/`unitPrice` sao um retrato do produto no momento da compra
 * (pode divergir do catalogo atual) - diferente de `favorite`
 * (`favorites.ts`), que sempre le o produto corrente pelo `sku`. Clientes mock
 * seguem `apps/web/lib/data/customer.ts`: Ana (`cliente-exemplo-1`) com
 * pedidos em status variados; Bruno (`cliente-exemplo-2`) sem nenhum, para
 * exercitar o estado vazio de `/account/pedidos`.
 */
const ORDERS: readonly CustomerOrder[] = [
  {
    customerId: 'cliente-exemplo-1',
    order: orderSchema.parse({
      id: 'pedido-1001',
      placedAt: '2026-10-01T14:32:00-03:00',
      status: 'delivered',
      items: [
        { sku: 'SKU-0002', name: 'Produto 2', quantity: 1, unitPrice: 69.9 },
        { sku: 'SKU-0005', name: 'Produto 5', quantity: 2, unitPrice: 99.9 },
      ],
      subtotal: 269.7,
      total: 269.7,
    }),
  },
  {
    customerId: 'cliente-exemplo-1',
    order: orderSchema.parse({
      id: 'pedido-1002',
      placedAt: '2026-10-20T09:15:00-03:00',
      status: 'inTransit',
      items: [{ sku: 'SKU-0008', name: 'Produto 8', quantity: 1, unitPrice: 129.9 }],
      subtotal: 129.9,
      total: 129.9,
    }),
  },
  {
    customerId: 'cliente-exemplo-1',
    order: orderSchema.parse({
      id: 'pedido-1003',
      placedAt: '2026-11-02T18:00:00-03:00',
      status: 'processing',
      items: [{ sku: 'SKU-0015', name: 'Produto 15', quantity: 1, unitPrice: 199.9 }],
      subtotal: 199.9,
      total: 199.9,
    }),
  },
  {
    customerId: 'cliente-exemplo-1',
    order: orderSchema.parse({
      id: 'pedido-1004',
      placedAt: '2026-09-10T11:20:00-03:00',
      status: 'canceled',
      items: [{ sku: 'SKU-0003', name: 'Produto 3', quantity: 1, unitPrice: 79.9 }],
      subtotal: 79.9,
      total: 79.9,
    }),
  },
];

/** Pedidos do cliente, do mais recente para o mais antigo. */
export async function findOrdersByCustomerId(customerId: string): Promise<Order[]> {
  return ORDERS.filter((o) => o.customerId === customerId)
    .map((o) => o.order)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

/**
 * So retorna o pedido quando ele pertence a ESTE cliente - nunca so pelo id
 * (evita IDOR: um id de pedido adivinhado nunca deve expor o pedido de outra
 * pessoa). `null` cobre tanto "pedido nao existe" quanto "pedido de outro
 * cliente" - de propriedade, a pagina de detalhe chama `notFound()` nos dois
 * casos, sem distinguir a resposta (distinguir vazaria que o id existe).
 */
export async function findOrderByIdForCustomer(orderId: string, customerId: string): Promise<Order | null> {
  const match = ORDERS.find((o) => o.order.id === orderId && o.customerId === customerId);
  return match?.order ?? null;
}
