import { z } from 'zod';

const option = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  /** Prazo em dias uteis: [min, max]. */
  days: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
});

/** Espelha `pdpSections.pdp-shipping.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpShippingSchema = z.strictObject({
  zipInput: z.boolean().default(true),
  /** Link de ajuda ("Nao sei meu CEP"). */
  helpHref: z.string().min(1).optional(),
  /** CEP ja informado (so digitos ou 12345-678). */
  cep: z.string().optional(),
  /** Resultado da cotacao (data layer): opcoes ou mensagem de erro. */
  quote: z.union([z.strictObject({ options: z.array(option).min(1) }), z.strictObject({ error: z.string().min(1) })]).optional(),
  labels: z
    .strictObject({
      title: z.string(),
      label: z.string(),
      hint: z.string(),
      submit: z.string(),
      help: z.string(),
      free: z.string(),
      days: z.string(),
      daysSingle: z.string(),
      invalid: z.string(),
    })
    .partial()
    .optional(),
});

export type PdpShippingProps = z.input<typeof pdpShippingSchema>;
