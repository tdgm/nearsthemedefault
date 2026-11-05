import { z } from 'zod';

/** Espelha `sections.faq.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const faqSchema = z.strictObject({
  /** Minimo de 3: FAQ fina nao vale o FAQPage (nears/contracts.yaml). */
  items: z.array(z.strictObject({ question: z.string().min(1), answer: z.string().min(1) })).min(3),
  title: z.string().optional(),
});

export type FaqProps = z.input<typeof faqSchema>;
