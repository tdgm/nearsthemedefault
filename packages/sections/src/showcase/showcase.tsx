import { Container, Tabs } from '@nears/ui';
import { ProductRail } from '../shared/product-rail.tsx';
import type { ShowcaseProps } from './showcase.schema';

const defaultTitles = {
  static: 'Destaques',
  tabs: 'Destaques',
  personalized: 'Escolhidos para você',
  wishlist: 'Seus favoritos',
  recommended: 'Você também pode gostar',
} as const;

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
    <Container as="section" className="mb-20 [contain-intrinsic-size:auto_520px] [content-visibility:auto]">
      <h2 className="mb-4 text-xl font-heading text-balance md:text-2xl">{heading}</h2>
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
    </Container>
  );
}
