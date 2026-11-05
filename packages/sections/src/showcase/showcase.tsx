import { Tabs } from '@nears/ui';
import { ProductCard } from '../product-card/product-card.tsx';
import type { ProductCardProps } from '../product-card/product-card.schema';
import type { ShowcaseProps } from './showcase.schema';

const defaultTitles = {
  static: 'Destaques',
  tabs: 'Destaques',
  personalized: 'Escolhidos para você',
  wishlist: 'Seus favoritos',
  recommended: 'Você também pode gostar',
} as const;

const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 176px';

/**
 * Faixa de produtos: scroll-snap nativo no mobile (os cards tem links, entao a
 * faixa ja e alcancavel por teclado), grade de 4 colunas no desktop. Tudo lazy
 * (secao `lazy`, abaixo da dobra) com `content-visibility: auto`.
 */
function ProductRail({ products, limit }: { products: ProductCardProps[]; limit: number }) {
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

/**
 * Vitrine de produtos em cinco variantes (static, tabs, personalized, wishlist,
 * recommended). `tabs` usa o `Tabs` do design system (setas, Home/End) e deixa
 * TODOS os paineis no HTML inicial (os inativos com `hidden`), entao o conteudo e
 * indexavel; quando o data layer so enviar a primeira aba (`ssrFirstTab`), as
 * demais carregam sob demanda (Fase 6). Variantes sem produtos somem, exceto
 * `wishlist`, que explica o vazio. O JSON-LD ItemList sai de /lib/seo (Fase 7).
 */
export function Showcase({ variant = 'static', title, limit = 8, tabs, products = [], labels }: ShowcaseProps) {
  const heading = title ?? labels?.titles?.[variant] ?? defaultTitles[variant];
  const empty = labels?.empty ?? 'Você ainda não favoritou nenhum produto.';
  const isTabs = variant === 'tabs' && tabs && tabs.length > 0;

  if (!isTabs && products.length === 0 && variant !== 'wishlist') return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 [contain-intrinsic-size:auto_520px] [content-visibility:auto]">
      <h2 className="mb-4 text-xl font-bold text-balance md:text-2xl">{heading}</h2>
      {isTabs ? (
        <Tabs
          label={labels?.tabs ?? heading}
          tabs={tabs.map((tab, i) => ({
            id: tab.id ?? `aba-${i + 1}`,
            label: tab.label,
            content: <ProductRail products={tab.products} limit={limit} />,
          }))}
        />
      ) : products.length > 0 ? (
        <ProductRail products={products} limit={limit} />
      ) : (
        <p className="py-8 text-on-surface-muted">{empty}</p>
      )}
    </section>
  );
}
