import { z } from 'zod';

/** Espelha `sections.text-seo.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const textSeoSchema = z.strictObject({
  /** Preferir pergunta (GEO). */
  title: z.string().optional(),
  /** Paragrafos separados por linha em branco. O PRIMEIRO responde direto a pergunta do titulo. */
  richText: z.string().min(1),
  collapsible: z.boolean().default(true),
  /** Altura (px) do trecho visivel quando recolhido, em navegadores com `::details-content`. */
  collapsedHeight: z.number().int().positive().default(160),
  labels: z.strictObject({ more: z.string().optional(), less: z.string().optional() }).optional(),
});

export type TextSeoProps = z.input<typeof textSeoSchema>;
