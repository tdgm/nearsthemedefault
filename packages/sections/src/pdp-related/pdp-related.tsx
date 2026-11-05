import { ProductRail } from '../shared/product-rail.tsx';
import type { PdpRelatedProps } from './pdp-related.schema';

/**
 * Produtos relacionados a este, em faixa com scroll-snap nativo (mobile) e grade (desktop).
 * Abaixo da dobra: cards lazy e `content-visibility: auto`. Sem produtos a secao
 * some. O JSON-LD ItemList sai de /lib/seo (Fase 7).
 */
export function PdpRelated({ title = 'Você também pode gostar', products = [] }: PdpRelatedProps) {
  if (products.length === 0) return null;
  return (
    <section className="py-6 [contain-intrinsic-size:auto_520px] [content-visibility:auto]">
      <h2 className="mb-4 text-xl font-bold text-balance md:text-2xl">{title}</h2>
      <ProductRail products={products} limit={8} />
    </section>
  );
}
