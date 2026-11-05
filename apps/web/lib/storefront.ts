// Conteudo provisorio das sections globais (so durante a construcao do template).
// Nas Fases 6+ vem do CMS/backend. Textos neutros, sem marca nem nicho: o que varia
// por nicho (carrinho/sacola, favoritos...) vem do vocabulary. Todo objeto passa
// pelo schema Zod da section antes de ser usado.
import {
  customerServiceSchema,
  footerSchema,
  headerSchema,
  minicartSchema,
  navDrawerSchema,
  promoBarSchema,
} from '@nears/sections';
import { getDepartments, getStore } from './data/client';
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
        { title: 'Institucional', links: [{ label: 'Mapa do site', href: '/mapa-do-site' }, { label: 'Página exemplo', href: '/pagina-exemplo' }] },
        { title: 'Ajuda', links: [{ label: 'Buscar', href: '/s' }] },
      ],
      legal: { companyName: store.name, copyright: `© ${store.name}. Conteúdo provisório do rodapé.` },
    }),
    customerService: customerServiceSchema.parse({ channels: [{ label: 'Central de ajuda', href: '/mapa-do-site' }] }),
  };
}
