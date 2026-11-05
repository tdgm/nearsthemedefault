import { z } from 'zod';

const option = z.strictObject({
  value: z.string().min(1),
  label: z.string().min(1),
  swatch: z.string().optional(),
  unavailable: z.boolean().optional(),
});

/** Espelha `pdpSections.pdp-buybox.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpBuyboxSchema = z.strictObject({
  name: z.string().min(1),
  rating: z.strictObject({ value: z.number().min(0).max(5), count: z.number().int().nonnegative() }).optional(),
  price: z.number().nonnegative(),
  listPrice: z.number().nonnegative().optional(),
  installments: z.strictObject({ count: z.number().int().min(1) }).optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
  sku: z.string().min(1).optional(),
  /** Endpoint (POST) do adicionar ao carrinho. Sem ele o CTA fica desabilitado. */
  addToCartAction: z.string().min(1).optional(),
  /** Um seletor por eixo de catalog.variantAxes; vazio quando o nicho nao tem variacao. */
  variantSelectors: z
    .array(z.strictObject({ id: z.string().min(1), label: z.string().min(1), display: z.enum(['swatch', 'option']), options: z.array(option).min(1) }))
    .default([]),
  /** Link do guia (medidas, compatibilidade...). So existe com catalog.guide.enabled. */
  guideHref: z.string().min(1).optional(),
  /** Texto do CTA; default vem de vocabulary.addToCart. */
  cta: z.string().min(1).optional(),
  stickyMobile: z.boolean().default(true),
  labels: z
    .strictObject({
      sku: z.string(),
      reviews: z.string(),
      guide: z.string(),
      outOfStock: z.string(),
      preorder: z.string(),
      adding: z.string(),
      added: z.string(),
      addError: z.string(),
      unavailable: z.string(),
    })
    .partial()
    .optional(),
});

export type PdpBuyboxProps = z.input<typeof pdpBuyboxSchema>;
