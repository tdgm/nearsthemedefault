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
import { vocab } from './manifest';

const departments = [1, 2, 3].map((n) => ({
  label: `Departamento ${n}`,
  href: `/departamento-${n}`,
  groups: [
    {
      label: `Categoria ${n}.1`,
      href: `/departamento-${n}/categoria-1`,
      links: [
        { label: `Subcategoria ${n}.1.1`, href: `/departamento-${n}/categoria-1/subcategoria-1` },
        { label: `Subcategoria ${n}.1.2`, href: `/departamento-${n}/categoria-1/subcategoria-2` },
      ],
    },
    { label: `Categoria ${n}.2`, href: `/departamento-${n}/categoria-2`, links: [] },
  ],
}));

export function getStorefront() {
  const cart = vocab('cart');
  const wishlist = vocab('wishlist');

  const header = headerSchema.parse({
    logo: { src: '/logo-placeholder.svg', width: 120, height: 32, alt: 'Loja' },
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
        { title: 'Institucional', links: [{ label: 'Mapa do site', href: '/mapa-do-site' }] },
        { title: 'Ajuda', links: [{ label: 'Buscar', href: '/s' }] },
      ],
      legal: { companyName: 'Loja', copyright: '© Loja. Conteúdo provisório do rodapé.' },
    }),
    customerService: customerServiceSchema.parse({ channels: [{ label: 'Central de ajuda', href: '/mapa-do-site' }] }),
  };
}
