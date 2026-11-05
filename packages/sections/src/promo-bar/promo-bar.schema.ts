import { z } from 'zod';

/** Espelha `globals.promo-bar.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const promoBarSchema = z.strictObject({
  message: z.string().min(1),
  href: z.string().optional(),
  countdown: z.strictObject({ endsAt: z.iso.datetime({ offset: true }) }).optional(),
  dismissible: z.boolean().optional(),
  rulesHref: z.string().optional(),
  labels: z
    .strictObject({
      region: z.string(),
      dismiss: z.string(),
      endsAt: z.string(),
      rules: z.string(),
    })
    .partial()
    .optional(),
});

export type PromoBarProps = z.infer<typeof promoBarSchema>;
