import { z } from 'zod';
import { productCardSchema } from '../product-card/product-card.schema.ts';

/** Espelha `pdpSections.pdp-related.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpRelatedSchema = z.strictObject({
  /** Titulo do bloco; o default vem do vocabulario da loja quando o container o informa. */
  title: z.string().min(1).optional(),
  products: z.array(productCardSchema).default([]),
});

export type PdpRelatedProps = z.input<typeof pdpRelatedSchema>;
