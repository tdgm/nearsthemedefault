import { z } from 'zod';

/** Espelha `sections.benefit-bar.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const benefitBarSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        /** Glifo decorativo curto (caractere ou simbolo); nunca carrega significado sozinho. */
        icon: z.string().optional(),
        label: z.string().min(1),
        href: z.string().optional(),
      }),
    )
    .min(1),
  /** Nome do grupo para leitores de tela. */
  label: z.string().optional(),
});

export type BenefitBarProps = z.input<typeof benefitBarSchema>;
