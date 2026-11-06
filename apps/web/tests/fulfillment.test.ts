import { describe, expect, it } from 'vitest';
import { findNearestStore, estimateDistanceKm } from '../lib/data/stores';
import { hasStockAtStore } from '../lib/data/store-inventory';
import { quotePickup } from '../lib/data/pickup';
import { loadConfig, type NearsConfig } from '../lib/manifest';

/** Config com o default do template (centralized/shared, pickup/delivery desligados). */
const centralized = (): NearsConfig => structuredClone(loadConfig());

/** Config com fulfillment "ligado" (ship-from-store + per-store), para exercitar os ramos aditivos. */
const shipFromStore = (overrides: Partial<NearsConfig['fulfillment']['inventory']> = {}): NearsConfig => {
  const config = structuredClone(loadConfig());
  config.fulfillment.mode = 'ship-from-store';
  config.fulfillment.pickup.enabled = true;
  config.fulfillment.delivery.shipFromStore = true;
  config.fulfillment.inventory = { mode: 'per-store', provider: 'mock', ...overrides };
  return config;
};

describe('findNearestStore / estimateDistanceKm (fixture de lojas, ADR 0028)', () => {
  it('distancia e simetrica e zero para o mesmo CEP', () => {
    expect(estimateDistanceKm('01310200', '01310200')).toBe(0);
    expect(estimateDistanceKm('01310200', '22020001')).toBe(estimateDistanceKm('22020001', '01310200'));
  });

  it('acha a loja mais proxima pelo prefixo regional do CEP', async () => {
    expect((await findNearestStore('01310200'))?.store.id).toBe('loja-sp');
    expect((await findNearestStore('22020001'))?.store.id).toBe('loja-rj');
    expect((await findNearestStore('30130000'))?.store.id).toBe('loja-bh');
    expect((await findNearestStore('90020007'))?.store.id).toBe('loja-poa');
  });
});

describe('hasStockAtStore (estoque granular por loja, contracts.yaml > data.storeInventory)', () => {
  it('true so com quantidade > 0 e reservavel', async () => {
    expect(await hasStockAtStore('loja-sp', 'SKU-0001')).toBe(true);
    expect(await hasStockAtStore('loja-bh', 'SKU-0001')).toBe(true);
  });

  it('false quando a quantidade e zero', async () => {
    expect(await hasStockAtStore('loja-rj', 'SKU-0001')).toBe(false);
  });

  it('false quando existe no estoque mas nao e reservavel', async () => {
    expect(await hasStockAtStore('loja-sp', 'SKU-0003')).toBe(false);
  });

  it('false quando nao ha entrada para o par loja/sku', async () => {
    expect(await hasStockAtStore('loja-poa', 'SKU-0001')).toBe(false);
  });
});

describe('quotePickup (ADITIVO sobre quoteShipping, ADR 0028)', () => {
  it('no-op (undefined) com fulfillment.mode = centralized, mesmo com CEP valido', async () => {
    expect(await quotePickup('01310-200', 'SKU-0001', centralized())).toBeUndefined();
  });

  it('no-op (undefined) sem CEP informado, mesmo com fulfillment ligado', async () => {
    expect(await quotePickup(undefined, 'SKU-0001', shipFromStore())).toBeUndefined();
    expect(await quotePickup('', 'SKU-0001', shipFromStore())).toBeUndefined();
  });

  it('CEP invalido: erro, nunca undefined, com fulfillment ligado', async () => {
    const result = await quotePickup('123', 'SKU-0001', shipFromStore());
    expect(result).toEqual({ error: 'Informe um CEP válido com 8 dígitos.' });
  });

  it('retirada disponivel: loja com pickupEnabled, estoque per-store ok', async () => {
    const result = await quotePickup('01310-200', 'SKU-0001', shipFromStore());
    expect(result).toMatchObject({ store: { id: 'loja-sp', name: 'Loja Paulista' }, distanceKm: 0, pickup: { etaMinutes: 90 } });
    expect(result).not.toHaveProperty('delivery');
  });

  it('sem estoque per-store na loja mais proxima: nem retirada nem entrega', async () => {
    // loja-rj tem SKU-0001 com quantity: 0 - stockOk falha para pickup E delivery.
    const result = await quotePickup('22020-001', 'SKU-0001', shipFromStore());
    expect(result).toEqual({ error: 'Não há retirada nem entrega por loja disponível para este CEP.' });
  });

  it('inventory.mode = shared: ignora o estoque por loja, retirada funciona mesmo com quantity 0 na loja', async () => {
    const result = await quotePickup('22020-001', 'SKU-0001', shipFromStore({ mode: 'shared' }));
    expect(result).toMatchObject({ store: { id: 'loja-rj' }, pickup: { etaMinutes: 90 } });
  });

  it('loja sem retirada (pickupEnabled: false) mas com entrega por loja: so delivery', async () => {
    const result = await quotePickup('30130-000', 'SKU-0001', shipFromStore());
    expect(result).toMatchObject({ store: { id: 'loja-bh' }, distanceKm: 0, delivery: { etaMinutes: 180 } });
    expect(result).not.toHaveProperty('pickup');
  });

  it('sku ausente nunca bloqueia a cotacao: estoque por loja e pulado, como em "shared"', async () => {
    const result = await quotePickup('01310-200', undefined, shipFromStore());
    expect(result).toMatchObject({ store: { id: 'loja-sp' }, pickup: { etaMinutes: 90 } });
  });
});
