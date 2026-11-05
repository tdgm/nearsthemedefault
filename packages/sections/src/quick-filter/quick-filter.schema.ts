import { z } from 'zod';

/** Espelha `sections.quick-filter.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const quickFilterSchema = z.strictObject({
  chips: z.array(z.strictObject({ label: z.string().min(1), facet: z.string().min(1), value: z.string().min(1) })).min(1),
  /** Caminho da colecao atual; os chips acrescentam `?faceta=valor`. */
  basePath: z.string().default(''),
  /** Filtros ja aplicados (faceta -> valor): destaca o chip e habilita o toggle. */
  current: z.record(z.string(), z.string()).default({}),
  labels: z.strictObject({ region: z.string().optional() }).optional(),
});

export type QuickFilterProps = z.input<typeof quickFilterSchema>;
