import { z } from 'zod';

const pickupResult = z.strictObject({
  store: z.strictObject({ id: z.string().min(1), name: z.string().min(1), address: z.string().min(1) }),
  distanceKm: z.number().nonnegative(),
  pickup: z.strictObject({ etaMinutes: z.number().int().positive() }).optional(),
  delivery: z.strictObject({ etaMinutes: z.number().int().positive() }).optional(),
});

/** Espelha `pdpSections.pdp-pickup.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpPickupSchema = z.strictObject({
  /** CEP ja informado (so digitos ou 12345-678) - MESMO de pdp-shipping. */
  cep: z.string().optional(),
  /** Resultado da cotacao de retirada/entrega por loja (data layer > pickup.ts). */
  quote: z.union([pickupResult, z.strictObject({ error: z.string().min(1) })]).optional(),
  labels: z
    .strictObject({
      title: z.string(),
      hint: z.string(),
      pickupLine: z.string(),
      deliveryLine: z.string(),
      distance: z.string(),
    })
    .partial()
    .optional(),
});

export type PdpPickupProps = z.input<typeof pdpPickupSchema>;
