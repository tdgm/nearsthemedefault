import { z } from 'zod';

export const cartItemSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  href: z.string().optional(),
  image: z.strictObject({ src: z.string(), width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
  /** Valores de variacao ja formatados ("Azul / M"). */
  variant: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

/** Espelha `globals.minicart.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const minicartSchema = z.strictObject({
  items: z.array(cartItemSchema),
  cartHref: z.string().optional(),
  checkoutHref: z.string().optional(),
  continueHref: z.string().optional(),
  /** Valor a partir do qual o frete e gratis; mostra quanto falta. */
  freeShippingFrom: z.number().nonnegative().optional(),
  labels: z
    .strictObject({
      title: z.string(),
      close: z.string(),
      empty: z.string(),
      continue: z.string(),
      subtotal: z.string(),
      viewCart: z.string(),
      checkout: z.string(),
      quantity: z.string(),
      freeShipping: z.string(),
      freeShippingReached: z.string(),
      itemsSingular: z.string(),
      itemsPlural: z.string(),
    })
    .partial()
    .optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type MinicartProps = z.infer<typeof minicartSchema>;
