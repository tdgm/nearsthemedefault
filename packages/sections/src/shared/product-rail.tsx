import { ProductCard } from '../product-card/product-card.tsx';
import type { ProductCardProps } from '../product-card/product-card.schema';

const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 176px';

/**
 * Faixa de produtos: scroll-snap nativo no mobile (os cards tem links, entao a
 * faixa ja e alcancavel por teclado), grade de 4 colunas no desktop. Usada por
 * showcase, pdp-bundle e pdp-related. Zero JS.
 */
export function ProductRail({ products, limit = 8 }: { products: ProductCardProps[]; limit?: number }) {
  return (
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {products.slice(0, limit).map((product) => (
        <li key={product.href} className="w-44 shrink-0 snap-start md:w-auto">
          <ProductCard {...product} sizes={SIZES} />
        </li>
      ))}
    </ul>
  );
}
