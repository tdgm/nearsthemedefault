import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.banner-grid.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const bannerGridSchema = z.strictObject({
  /** O manifest declara o enum como texto ("2" | "3" | "4"). */
  columns: z.enum(['2', '3', '4']).default('3'),
  banners: z
    .array(
      z.strictObject({
        image: imageProp,
        /** Obrigatorio: descreve o banner (inclusive o texto da arte). */
        alt: z.string().min(1),
        href: z.string().optional(),
      }),
    )
    .min(1),
});

export type BannerGridProps = z.input<typeof bannerGridSchema>;
