// Conteudo provisorio das sections globais (so durante a construcao do template).
// Nas Fases 6+ vem do CMS/backend. Textos neutros, sem marca nem nicho: o que varia
// por nicho (carrinho/sacola, favoritos...) vem do vocabulary. Todo objeto passa
// pelo schema Zod da section antes de ser usado.
import { cookies } from 'next/headers';
import {
  customerServiceSchema,
  footerSchema,
  headerSchema,
  minicartSchema,
  navDrawerSchema,
  promoBarSchema,
  type MinicartProps,
} from '@nears/sections';
import { CART_COOKIE, decodeCartItems } from './cart/session';
import { resolveCartLines } from './data/cart';
import { getDepartments, getProducts, getStore } from './data/client';
import { vocab } from './manifest';

/** Navegacao dos departamentos a partir do data layer (categorias viram grupos; subcategorias, links). */
async function loadNavigation() {
  const list = await getDepartments();
  return list.map((d) => ({
    label: d.name,
    href: `/${d.slug}`,
    groups: d.categories.map((c) => ({
      label: c.name,
      href: `/${d.slug}/${c.slug}`,
      links: c.subcategories.map((sc) => ({ label: sc.name, href: `/${d.slug}/${c.slug}/${sc.slug}` })),
    })),
  }));
}

export async function getStorefront() {
  const [store, departments] = await Promise.all([getStore(), loadNavigation()]);
  const cart = vocab('cart');
  const wishlist = vocab('wishlist');

  const header = headerSchema.parse({
    logo: { ...store.logo, alt: store.logo.alt ?? store.name },
    nav: { departments },
    labels: {
      cart,
      wishlist,
      search: vocab('search'),
      searchLabel: vocab('searchLabel'),
      searchPlaceholder: vocab('searchPlaceholder'),
      searchSubmit: vocab('searchSubmit'),
    },
  });

  return {
    promoBar: promoBarSchema.parse({
      message: 'Conteúdo provisório da barra promocional',
      countdown: { endsAt: '2027-12-31T23:59:59-03:00' },
    }),
    header,
    navDrawer: navDrawerSchema.parse({ departments }),
    minicart: minicartSchema.parse({ items: [], labels: { title: cart, close: `Fechar ${cart.toLowerCase()}` } }),
    footer: footerSchema.parse({
      columns: [
        { title: 'Institucional', links: [{ label: 'Mapa do site', href: '/mapa-do-site' }, { label: 'Página exemplo', href: '/pagina-exemplo' }, { label: 'Nossas lojas', href: '/lojas' }] },
        { title: 'Ajuda', links: [{ label: 'Buscar', href: '/s' }] },
      ],
      legal: { companyName: store.name, copyright: `© ${store.name}. Conteúdo provisório do rodapé.` },
    }),
    customerService: customerServiceSchema.parse({ channels: [{ label: 'Central de ajuda', href: '/mapa-do-site' }] }),
  };
}

/**
 * Pecas de header/minicart que dependem do carrinho real (cookie
 * `nears_cart`, Fase 10, ADR 0029). Chamada SO de dentro da ilha dinamica do
 * layout raiz (`app/layout.tsx`), nunca de `getStorefront()`: essa precisa
 * continuar 100% estatica (Cache Components, ADR 0007) - ler `cookies()`
 * fora de um `Suspense` quebra o build, e `getStorefront()` e usada em toda
 * rota do site, estatica ou nao. `cartCount: 0`/`items: []` (o default de
 * `getStorefront()`) e o fallback do `Suspense` enquanto esta ilha resolve -
 * mesmo valor que esta funcao devolve pra carrinho vazio, entao nunca ha
 * layout shift quando o resultado chega.
 */
export async function getCartAwareChrome(): Promise<{ cartCount: number; items: MinicartProps['items'] }> {
  const jar = await cookies();
  const cartItems = decodeCartItems(jar.get(CART_COOKIE)?.value);
  if (cartItems.length === 0) return { cartCount: 0, items: [] };

  const products = await getProducts();
  const lines = resolveCartLines(cartItems, products);
  return {
    cartCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    items: lines.map((l) => {
      const image = l.product.images[0];
      return {
        id: l.sku,
        name: l.product.name,
        href: `/${l.product.slug}/p`,
        // `cartItemSchema.image` e um strictObject so com src/width/height - nunca
        // passa `alt` (que `Product.images[]` tem e o minicart nao usa).
        ...(image ? { image: { src: image.src, width: image.width, height: image.height } } : {}),
        quantity: l.quantity,
        unitPrice: l.product.price,
      };
    }),
  };
}
