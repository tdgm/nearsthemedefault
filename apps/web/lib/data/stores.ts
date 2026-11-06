// Lojas fisicas (contracts.yaml > data.store, ADR 0028 "fulfillment por loja").
// A lista real de lojas de uma loja Nears especifica e dado de runtime (como
// navigation.departments), nunca hardcoded em nears.config.yaml - este fixture
// so existe para desenvolvimento, nos mesmos moldes de customer.ts/orders.ts.
// Nomeado "PhysicalStore" (nao "Store") porque esse nome ja e usado em
// data/schemas.ts para a entidade "loja Nears" (organizacao/politicas/logo).
import { z } from 'zod';

export const storeAddressSchema = z.strictObject({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{8}$/, 'CEP com 8 digitos, sem mascara'),
});

export const storeSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ com 14 digitos, sem mascara'),
  address: storeAddressSchema,
  geoCoordinates: z.strictObject({ lat: z.number(), lng: z.number() }),
  pickupEnabled: z.boolean(),
  deliveryRadiusKm: z.number().positive(),
  openingHours: z.string().optional(),
});
export type PhysicalStore = z.infer<typeof storeSchema>;

export const STORES: readonly PhysicalStore[] = [
  {
    id: 'loja-sp',
    name: 'Loja Paulista',
    cnpj: '12345678000101',
    address: { street: 'Av. Paulista', number: '1000', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', postalCode: '01310200' },
    geoCoordinates: { lat: -23.5613, lng: -46.6565 },
    pickupEnabled: true,
    deliveryRadiusKm: 12,
    openingHours: 'Seg a sáb, 10h às 22h',
  },
  {
    id: 'loja-rj',
    name: 'Loja Copacabana',
    cnpj: '12345678000202',
    address: { street: 'Av. Nossa Senhora de Copacabana', number: '500', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', postalCode: '22020001' },
    geoCoordinates: { lat: -22.9707, lng: -43.1823 },
    pickupEnabled: true,
    deliveryRadiusKm: 10,
    openingHours: 'Seg a sáb, 10h às 22h',
  },
  {
    id: 'loja-bh',
    name: 'Loja Afonso Pena',
    cnpj: '12345678000303',
    address: { street: 'Av. Afonso Pena', number: '1500', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG', postalCode: '30130000' },
    geoCoordinates: { lat: -19.9245, lng: -43.9352 },
    // Sem retirada: so cumpre pedido por entrega a partir da propria loja (exercita o
    // ramo de delivery-sem-pickup de quotePickup).
    pickupEnabled: false,
    deliveryRadiusKm: 20,
  },
  {
    id: 'loja-poa',
    name: 'Loja Centro Histórico',
    cnpj: '12345678000404',
    address: { street: 'Rua dos Andradas', number: '900', neighborhood: 'Centro Histórico', city: 'Porto Alegre', state: 'RS', postalCode: '90020007' },
    geoCoordinates: { lat: -30.0331, lng: -51.23 },
    pickupEnabled: true,
    deliveryRadiusKm: 8,
    openingHours: 'Seg a sáb, 9h às 19h',
  },
];

export async function listStores(): Promise<PhysicalStore[]> {
  return [...STORES];
}

export type NearestStore = { store: PhysicalStore; distanceKm: number };

/**
 * Distancia estimada entre dois CEPs de 8 digitos: diferenca dos 3 primeiros
 * digitos (faixa regional dos Correios) * 0,6 km. Mock deterministico - sem
 * fonte real de geolocalizacao de loja ainda (ADR 0028, fora do escopo da 9d).
 * Espera CEPs ja normalizados (8 digitos); use `normalizeCep` antes de chamar.
 */
export function estimateDistanceKm(customerCep: string, storeCep: string): number {
  const c = Number(customerCep.slice(0, 3));
  const s = Number(storeCep.slice(0, 3));
  return Math.round(Math.abs(c - s) * 0.6 * 10) / 10;
}

/** Loja mais proxima pela distancia estimada, qualquer que seja (retirada ou nao). */
export async function findNearestStore(normalizedCep: string): Promise<NearestStore | null> {
  const candidates = STORES.map((store) => ({ store, distanceKm: estimateDistanceKm(normalizedCep, store.address.postalCode) }));
  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates[0] ?? null;
}
