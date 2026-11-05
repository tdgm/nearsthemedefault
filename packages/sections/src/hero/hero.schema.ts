import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.hero.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const heroSchema = z.strictObject({
  slides: z
    .array(
      z.strictObject({
        imageDesktop: imageProp,
        imageMobile: imageProp,
        /** Obrigatorio: descreve a campanha (inclusive o texto da arte). */
        alt: z.string().min(1),
        href: z.string().optional(),
        headline: z.string().optional(),
        /** Texto do botao; so aparece junto de `href`. */
        cta: z.string().optional(),
      }),
    )
    .min(1),
  /** Rotacao automatica. Desligada por padrao; com ela ha botao de pausa (WCAG 2.2.2). */
  autoplay: z.boolean().default(false),
  /** Intervalo da rotacao em ms (>= 3000). */
  intervalMs: z.number().int().min(3000).default(6000),
  labels: z.strictObject({ region: z.string().optional() }).optional(),
});

export type HeroProps = z.input<typeof heroSchema>;
