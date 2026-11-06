// Estoque granular por loja (contracts.yaml > data.storeInventory, ADR 0028).
// So consultado quando fulfillment.inventory.mode = "per-store"; com "shared"
// (default) o estoque e um pool unico (product.offers.availability), sem
// granularidade por loja - ver quotePickup em pickup.ts.
import { z } from 'zod';

export const storeInventorySchema = z.strictObject({
  storeId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  reservable: z.boolean(),
});
export type StoreInventory = z.infer<typeof storeInventorySchema>;

export const STORE_INVENTORY: readonly StoreInventory[] = [
  { storeId: 'loja-sp', sku: 'SKU-0001', quantity: 5, reservable: true },
  { storeId: 'loja-rj', sku: 'SKU-0001', quantity: 0, reservable: true },
  { storeId: 'loja-rj', sku: 'SKU-0002', quantity: 3, reservable: true },
  { storeId: 'loja-bh', sku: 'SKU-0001', quantity: 4, reservable: true },
  // Reservavel = false: existe no estoque mas nao pode ser prometido (ex.: bloqueado
  // para uma promocao em andamento) - exercita essa distincao de hasStockAtStore.
  { storeId: 'loja-sp', sku: 'SKU-0003', quantity: 2, reservable: false },
];

/** true so com quantidade > 0 E reservavel; sem entrada para o par = sem estoque. */
export async function hasStockAtStore(storeId: string, sku: string): Promise<boolean> {
  const entry = STORE_INVENTORY.find((i) => i.storeId === storeId && i.sku === sku);
  return Boolean(entry && entry.quantity > 0 && entry.reservable);
}
