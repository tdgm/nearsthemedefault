import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.event-banner.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const eventBannerSchema = z.strictObject({
  imageDesktop: imageProp,
  imageMobile: imageProp,
  /** Obrigatorio: descreve a campanha (o texto da arte precisa estar aqui). */
  alt: z.string().min(1),
  href: z.string().optional(),
});

export type EventBannerProps = z.input<typeof eventBannerSchema>;
