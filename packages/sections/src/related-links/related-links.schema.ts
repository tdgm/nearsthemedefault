import { z } from 'zod';

/** Ancoras genericas: nao dizem para onde o link vai (SEO e leitor de tela). */
const GENERIC = new Set(['clique aqui', 'saiba mais', 'ver mais', 'leia mais', 'aqui', 'veja mais', 'confira']);

/** Espelha `sections.related-links.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const relatedLinksSchema = z.strictObject({
  title: z.string().optional(),
  links: z
    .array(
      z.strictObject({
        label: z
          .string()
          .min(1)
          .refine((v) => !GENERIC.has(v.trim().toLowerCase()), 'use ancora descritiva (seo.descriptiveAnchors)'),
        href: z.string().min(1),
      }),
    )
    .min(1),
});

export type RelatedLinksProps = z.input<typeof relatedLinksSchema>;
