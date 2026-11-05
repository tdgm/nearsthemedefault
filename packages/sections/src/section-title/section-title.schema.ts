import { z } from 'zod';

/** Espelha `sections.section-title.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const sectionTitleSchema = z.strictObject({
  text: z.string().min(1),
  /** h2 por padrao; h1 so no titulo da pagina (templates collection, search e notfound, que nao tem outro H1); h3 so quando ha um h2 pai. */
  level: z.enum(['h1', 'h2', 'h3']).default('h2'),
  /** Com href, o titulo vira link ("ver tudo" fica no texto acessivel). */
  href: z.string().optional(),
});

export type SectionTitleProps = z.input<typeof sectionTitleSchema>;
