import { z } from 'zod';

/** Espelha `pdpSections.pdp-details.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpDetailsSchema = z.strictObject({
  /** Paragrafos separados por linha em branco. O 1o responde "o que e este produto?" (GEO). */
  description: z.string().optional(),
  /** Pares atributo/valor: <table> semantica (catalog.specTable). */
  specs: z.array(z.strictObject({ name: z.string().min(1), value: z.string().min(1) })).default([]),
  /** Cuidados, uso, instalacao, conservacao... conforme o nicho. */
  instructions: z.string().optional(),
  /** Guia auxiliar (medidas, compatibilidade, voltagem...): sempre tabela HTML, nunca imagem. */
  guide: z.strictObject({ columns: z.array(z.string().min(1)).min(1), rows: z.array(z.array(z.string())).min(1) }).optional(),
  labels: z
    .strictObject({
      title: z.string(),
      description: z.string(),
      specs: z.string(),
      instructions: z.string(),
      guide: z.string(),
      attribute: z.string(),
      value: z.string(),
    })
    .partial()
    .optional(),
});

export type PdpDetailsProps = z.input<typeof pdpDetailsSchema>;
