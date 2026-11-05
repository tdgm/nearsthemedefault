import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `pdpSections.pdp-gallery.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const pdpGallerySchema = z.strictObject({
  /** Cada foto exige `alt` (gerado por regra a partir do nome/atributos do produto). */
  images: z.array(imageProp.extend({ alt: z.string().min(1) })).min(1),
  zoom: z.boolean().default(true),
  /** Video do produto (URL do arquivo). Carrega so ao tocar em reproduzir (`preload="none"`). */
  video: z.string().min(1).optional(),
  thumbs: z.enum(['vertical', 'dots']).default('vertical'),
  /** Token de proporcao da midia (media.aspect): vem de catalog.productMedia.aspect. */
  aspect: z.enum(['product', 'portrait', 'landscape', 'square']).default('portrait'),
  labels: z
    .strictObject({
      gallery: z.string(),
      thumbs: z.string(),
      image: z.string(),
      zoom: z.string(),
      video: z.string(),
    })
    .partial()
    .optional(),
});

export type PdpGalleryProps = z.input<typeof pdpGallerySchema>;
