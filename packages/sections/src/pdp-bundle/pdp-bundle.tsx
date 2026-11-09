import { ProductRail } from '../shared/product-rail.tsx';
import type { PdpBundleProps } from './pdp-bundle.schema';

/**
 * Produtos que combinam com este, em faixa com scroll-snap nativo (mobile) e grade (desktop).
 * Abaixo da dobra: cards lazy e `content-visibility: auto`. Sem produtos a secao
 * some. O JSON-LD ItemList sai de /lib/seo (Fase 7).
 */
export function PdpBundle({ title = 'Compre junto', products = [] }: PdpBundleProps) {
  if (products.length === 0) return null;
  return (
    <section className="py-6 [contain-intrinsic-size:auto_520px] [content-visibility:auto]">
      <h2 className="mb-4 text-xl font-heading text-balance md:text-2xl">{title}</h2>
      <ProductRail products={products} limit={8} />
    </section>
  );
}
