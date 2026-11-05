import { z } from 'zod';

/** Espelha `pdpSections.pdp-reviews.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpReviewsSchema = z.strictObject({
  /** Origem das avaliacoes (nome do provedor/painel); vai para o JSON-LD e a atribuicao. */
  provider: z.string().min(1),
  aggregate: z.strictObject({ rating: z.number().min(0).max(5), count: z.number().int().nonnegative() }).optional(),
  items: z
    .array(
      z.strictObject({
        author: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        /** ISO 8601. */
        date: z.string().min(1),
        title: z.string().optional(),
        body: z.string().min(1),
      }),
    )
    .default([]),
  labels: z.strictObject({ title: z.string(), empty: z.string(), verified: z.string(), shown: z.string() }).partial().optional(),
});

export type PdpReviewsProps = z.input<typeof pdpReviewsSchema>;
