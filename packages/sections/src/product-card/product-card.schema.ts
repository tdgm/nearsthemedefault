import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.product-card.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const productCardSchema = z.strictObject({
  image: imageProp,
  /** Segunda foto, mostrada no hover (so em ponteiro fino) - decorativa. */
  hoverImage: imageProp.optional(),
  name: z.string().min(1),
  /** URL da PDP. */
  href: z.string().min(1),
  price: z.number().nonnegative(),
  listPrice: z.number().nonnegative().optional(),
  installments: z.strictObject({ count: z.number().int().min(1) }).optional(),
  badges: z
    .array(z.strictObject({ label: z.string().min(1), tone: z.enum(['neutral', 'promo', 'success', 'info']).default('neutral') }))
    .optional(),
  /** Amostras do primeiro eixo de variacao do nicho (catalog.variantAxes); vazio se nao ha variacao. */
  variantPreview: z.array(z.strictObject({ label: z.string().min(1), color: z.string().optional() })).optional(),
  quickAdd: z.boolean().default(false),
  /** Endpoint (POST) do "adicionar rapido". Sem ele, o botao nao e renderizado. */
  quickAddAction: z.string().optional(),
  wishlist: z.boolean().default(true),
  /** Endpoint (POST) de favoritar. Sem ele, o coracao nao e renderizado. */
  wishlistAction: z.string().optional(),
  /** Token de proporcao da midia (media.aspect): vem de catalog.productMedia.aspect. */
  aspect: z.enum(['product', 'portrait', 'landscape', 'square']).default('portrait'),
  /** Acima da dobra (resolvido pelo container, ADR 0006): eager + fetchpriority alto. */
  priority: z.boolean().default(false),
  /** `sizes` do layout do container (tokens media.sizes.productCard). */
  sizes: z.string().optional(),
  labels: z
    .strictObject({
      wishlist: z.string(),
      quickAdd: z.string(),
      variants: z.string(),
      more: z.string(),
    })
    .partial()
    .optional(),
});

export type ProductCardProps = z.input<typeof productCardSchema>;
