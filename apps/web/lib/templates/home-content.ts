// Conteudo PROVISORIO da home (o que o CMS entregara). A composicao (quais
// sections, em que ordem, quantos departamentos) vem do manifest; aqui so ha
// props por instancia. Textos neutros: nada de marca nem de nicho.
import { getDepartments, getProducts, getStore } from '../data/client';
import { cardAspect, toProductCard } from '../data/mappers';
import type { Department, Product } from '../data/schemas';
import { loadConfig } from '../manifest';
import type { SectionInstance } from './expand';

const BANNER = {
  desktop: { src: '/placeholders/hero-desktop.jpg', webp: '/placeholders/hero-desktop.webp', avif: '/placeholders/hero-desktop.avif', width: 1440, height: 560 },
  mobile: { src: '/placeholders/hero-mobile.jpg', webp: '/placeholders/hero-mobile.webp', avif: '/placeholders/hero-mobile.avif', width: 750, height: 900 },
} as const;
const SQUARE = { src: '/placeholders/category.svg', width: 600, height: 600 } as const;

const minPrice = (products: Product[]) => (products.length ? Math.min(...products.map((p) => p.price)) : undefined);

export async function getHomeContent() {
  const [store, departments, products] = await Promise.all([getStore(), getDepartments(), getProducts()]);
  const config = loadConfig();
  const aspect = cardAspect(config);
  const cards = (list: Product[], n: number) => list.slice(0, n).map((p) => toProductCard(p, { aspect }));
  const dept = (i: number): Department => {
    const d = departments[i];
    if (!d) throw new Error(`Home pede o departamento ${i}, mas so ha ${departments.length}`);
    return d;
  };

  const firstDept = dept(0);

  function propsFor(inst: SectionInstance): unknown | null {
    const d = inst.repeatIndex === undefined ? undefined : dept(inst.repeatIndex);
    switch (inst.id) {
      case 'hero':
        return {
          slides: [
            { imageDesktop: BANNER.desktop, imageMobile: BANNER.mobile, alt: 'Campanha principal da loja', href: '/campanha-exemplo', headline: 'Campanha principal', cta: 'Ver campanha' },
            { imageDesktop: BANNER.desktop, imageMobile: BANNER.mobile, alt: 'Segunda campanha da loja', href: `/${firstDept.slug}` },
          ],
        };
      case 'benefit-bar':
        return { label: 'Vantagens da loja', items: ['Frete grátis acima de um valor mínimo', 'Troca facilitada', 'Pagamento em até 3x sem juros', 'Atendimento por chat'].map((label) => ({ label })) };
      case 'section-title':
        return d ? { text: d.name, href: `/${d.slug}` } : { text: 'Campanhas em destaque', href: '/campanha-exemplo' };
      case 'banner-grid':
        return d
          ? { columns: '3', banners: [1, 2, 3].map((n) => ({ image: SQUARE, alt: `${d.name}: destaque ${n}`, href: `/${d.slug}` })) }
          : { columns: '2', banners: [1, 2].map((n) => ({ image: BANNER.mobile, alt: `Campanha em destaque ${n}`, href: '/campanha-exemplo' })) };
      case 'category-hub': {
        if (!d) return null;
        return {
          items: d.categories.map((c) => {
            const fromPrice = minPrice(products.filter((p) => p.department === d.slug && p.category === c.slug));
            return { image: SQUARE, label: c.name, href: `/${d.slug}/${c.slug}`, ...(fromPrice !== undefined ? { fromPrice } : {}) };
          }),
        };
      }
      case 'event-banner':
        return { imageDesktop: BANNER.desktop, imageMobile: BANNER.mobile, alt: inst.occurrence === 0 ? 'Evento sazonal da loja' : 'Oferta por tempo limitado', href: '/campanha-exemplo' };
      case 'showcase':
        if (inst.variant === 'tabs') {
          return {
            variant: 'tabs',
            title: 'Mais vendidos',
            source: 'collection',
            tabs: departments.slice(0, 3).map((x) => ({ id: x.slug, label: x.name, products: cards(products.filter((p) => p.department === x.slug), 8) })),
          };
        }
        return { variant: inst.variant ?? 'static', products: [] };
      case 'banner-full':
        return { image: BANNER.desktop, alt: '', headline: 'Conheça a loja', body: 'Seleção de produtos com entrega para todo o país.', cta: 'Ver departamentos', href: `/${firstDept.slug}` };
      case 'text-seo':
        return {
          title: `O que você encontra em ${store.name}?`,
          richText: `${store.name} reúne produtos organizados por departamento, com preço, parcelamento e prazo de entrega informados em cada página.\n\nCada departamento tem categorias e subcategorias para você chegar ao produto certo sem rodeios.\n\nAs condições de troca e de entrega aparecem na página de cada produto e valem para todo o país.`,
        };
      case 'faq':
        return {
          title: 'Perguntas frequentes',
          items: [
            { question: 'Como acompanho meu pedido?', answer: 'Você recebe o código de rastreio por e-mail assim que o pedido é despachado.' },
            { question: 'Quais são as formas de pagamento?', answer: 'Aceitamos cartão em até 3x sem juros, Pix e boleto.' },
            { question: 'Como faço uma troca?', answer: 'Solicite a troca na página do pedido dentro do prazo informado na página do produto.' },
          ],
        };
      case 'related-links':
        return { title: 'Explore a loja', links: departments.map((x) => ({ label: `Produtos de ${x.name}`, href: `/${x.slug}` })).concat([{ label: 'Mapa do site com todas as categorias', href: '/mapa-do-site' }]) };
      default:
        return null;
    }
  }

  return { storeName: store.name, departmentCount: departments.length, propsFor };
}
