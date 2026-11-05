import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.banner-full.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const bannerFullSchema = z.strictObject({
  image: imageProp,
  alt: z.string(),
  headline: z.string().min(1),
  body: z.string().optional(),
  /** Texto do botao. Sem `cta` e `href`, o banner nao tem botao. */
  cta: z.string().optional(),
  href: z.string().optional(),
  /** Imagem a direita no desktop (padrao: esquerda). */
  imageSide: z.enum(['left', 'right']).default('left'),
});

export type BannerFullProps = z.input<typeof bannerFullSchema>;
