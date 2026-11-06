// Retirada/entrega pela loja mais proxima (ADR 0028 "fulfillment por loja").
// ADITIVO sobre shipping.ts, nunca substituicao: quoteShipping continua
// representando a cotacao do CD central, inalterada; quotePickup so existe
// quando fulfillment.mode != "centralized" (nears.config.yaml), e e sempre
// undefined (no-op) nesse caso - exatamente o comportamento de hoje, sem a
// loja envolvida. Reusa o MESMO ?cep= de pdp-shipping: nunca pede o CEP de novo.
import { z } from 'zod';
import { loadConfig, type NearsConfig } from '../manifest';
import { normalizeCep } from './shipping';
import { findNearestStore } from './stores';
import { hasStockAtStore } from './store-inventory';

const pickupResultSchema = z.strictObject({
  store: z.strictObject({ id: z.string().min(1), name: z.string().min(1), address: z.string().min(1) }),
  distanceKm: z.number().nonnegative(),
  pickup: z.strictObject({ etaMinutes: z.number().int().positive() }).optional(),
  delivery: z.strictObject({ etaMinutes: z.number().int().positive() }).optional(),
});

export const pickupQuoteSchema = z.union([pickupResultSchema, z.strictObject({ error: z.string().min(1) })]);
export type PickupQuote = z.infer<typeof pickupQuoteSchema>;

/**
 * `sku` ausente (produto sem SKU cadastrado) nunca bloqueia a cotacao: so a
 * checagem de estoque por loja e pulada, como se o modo fosse "shared".
 */
export async function quotePickup(rawCep: string | undefined, sku: string | undefined, config: NearsConfig = loadConfig()): Promise<PickupQuote | undefined> {
  const { fulfillment } = config;
  if (fulfillment.mode === 'centralized') return undefined;
  if (rawCep === undefined || rawCep.trim() === '') return undefined;
  const cep = normalizeCep(rawCep);
  if (!cep) return pickupQuoteSchema.parse({ error: 'Informe um CEP válido com 8 dígitos.' });

  const nearest = await findNearestStore(cep);
  if (!nearest) return pickupQuoteSchema.parse({ error: 'Nenhuma loja encontrada para este CEP.' });
  const { store, distanceKm } = nearest;

  const stockOk = fulfillment.inventory.mode === 'shared' || !sku || (await hasStockAtStore(store.id, sku));
  const pickupOk = fulfillment.pickup.enabled && store.pickupEnabled && stockOk;
  const deliveryOk = fulfillment.delivery.shipFromStore && distanceKm <= store.deliveryRadiusKm && stockOk;

  if (!pickupOk && !deliveryOk) {
    return pickupQuoteSchema.parse({ error: 'Não há retirada nem entrega por loja disponível para este CEP.' });
  }

  return pickupQuoteSchema.parse({
    store: { id: store.id, name: store.name, address: `${store.address.neighborhood}, ${store.address.city} - ${store.address.state}` },
    distanceKm,
    ...(pickupOk ? { pickup: { etaMinutes: fulfillment.pickup.slaMinutesDefault } } : {}),
    ...(deliveryOk
      ? { delivery: { etaMinutes: distanceKm <= store.deliveryRadiusKm / 2 ? fulfillment.delivery.slaMinutesExpress : fulfillment.delivery.slaMinutesStandard } }
      : {}),
  });
}

/**
 * Mesma cotacao de `quotePickup`, mas pro CARRINHO (varios SKUs de uma vez,
 * Fase 10, ADR 0029): aditivo sobre `quotePickup`, mesma loja mais proxima,
 * so que o estoque precisa estar OK pra TODOS os SKUs do carrinho na mesma
 * loja - "retire/receba o carrinho inteiro numa unica loja", nunca retirada
 * parcial. Se a lista de SKUs estiver vazia, comporta-se como sem SKU
 * nenhum (so checa pickup/delivery habilitados na loja, sem checar estoque -
 * mesmo fallback de `quotePickup` quando `sku` e `undefined`).
 */
export async function quoteCartPickup(rawCep: string | undefined, skus: readonly string[], config: NearsConfig = loadConfig()): Promise<PickupQuote | undefined> {
  const { fulfillment } = config;
  if (fulfillment.mode === 'centralized') return undefined;
  if (rawCep === undefined || rawCep.trim() === '') return undefined;
  const cep = normalizeCep(rawCep);
  if (!cep) return pickupQuoteSchema.parse({ error: 'Informe um CEP válido com 8 dígitos.' });

  const nearest = await findNearestStore(cep);
  if (!nearest) return pickupQuoteSchema.parse({ error: 'Nenhuma loja encontrada para este CEP.' });
  const { store, distanceKm } = nearest;

  const stockOk =
    fulfillment.inventory.mode === 'shared' || skus.length === 0 || (await Promise.all(skus.map((sku) => hasStockAtStore(store.id, sku)))).every(Boolean);
  const pickupOk = fulfillment.pickup.enabled && store.pickupEnabled && stockOk;
  const deliveryOk = fulfillment.delivery.shipFromStore && distanceKm <= store.deliveryRadiusKm && stockOk;

  if (!pickupOk && !deliveryOk) {
    return pickupQuoteSchema.parse({ error: 'Não há retirada nem entrega por loja disponível para este CEP.' });
  }

  return pickupQuoteSchema.parse({
    store: { id: store.id, name: store.name, address: `${store.address.neighborhood}, ${store.address.city} - ${store.address.state}` },
    distanceKm,
    ...(pickupOk ? { pickup: { etaMinutes: fulfillment.pickup.slaMinutesDefault } } : {}),
    ...(deliveryOk
      ? { delivery: { etaMinutes: distanceKm <= store.deliveryRadiusKm / 2 ? fulfillment.delivery.slaMinutesExpress : fulfillment.delivery.slaMinutesStandard } }
      : {}),
  });
}
