import { z } from 'zod';
import { productCardSchema } from '../product-card/product-card.schema.ts';

export const SHOWCASE_VARIANTS = ['static', 'tabs', 'personalized', 'wishlist', 'recommended'] as const;

/** Espelha `sections.showcase.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const showcaseSchema = z.strictObject({
  /** Variante do template (`showcase:tabs`). Muda titulo padrao e tratamento do vazio. */
  variant: z.enum(SHOWCASE_VARIANTS).default('static'),
  title: z.string().optional(),
  /** De onde o data layer tira os produtos (nao muda a renderizacao). */
  source: z.enum(['collection', 'query', 'recommender']).optional(),
  /** Maximo de cards exibidos (4 a 12). */
  limit: z.number().int().min(4).max(12).default(8),
  /** So na variante `tabs`: cada aba com seus produtos (todos no HTML inicial). */
  tabs: z.array(z.strictObject({ id: z.string().min(1).optional(), label: z.string().min(1), products: z.array(productCardSchema) })).optional(),
  products: z.array(productCardSchema).default([]),
  labels: z
    .strictObject({
      tabs: z.string(),
      empty: z.string(),
      titles: z.partialRecord(z.enum(SHOWCASE_VARIANTS), z.string()),
    })
    .partial()
    .optional(),
});

export type ShowcaseProps = z.input<typeof showcaseSchema>;
