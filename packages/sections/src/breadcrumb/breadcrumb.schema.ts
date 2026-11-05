import { z } from 'zod';

/** Espelha `sections.breadcrumb.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const breadcrumbSchema = z.strictObject({
  /** Ultimo item = pagina atual (sem link). */
  items: z.array(z.strictObject({ label: z.string().min(1), href: z.string().optional() })).min(1),
  /** Nome do landmark. */
  label: z.string().optional(),
});

export type BreadcrumbSectionProps = z.input<typeof breadcrumbSchema>;
