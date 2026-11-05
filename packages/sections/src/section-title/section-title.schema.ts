import { z } from 'zod';

/** Espelha `sections.section-title.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const sectionTitleSchema = z.strictObject({
  text: z.string().min(1),
  /** h2 por padrao; h3 so quando ha um h2 pai (hierarquia sem pular nivel). */
  level: z.enum(['h2', 'h3']).default('h2'),
  /** Com href, o titulo vira link ("ver tudo" fica no texto acessivel). */
  href: z.string().optional(),
});

export type SectionTitleProps = z.input<typeof sectionTitleSchema>;
