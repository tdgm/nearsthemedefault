// Conteudo da PDP: transforma um Product (data layer) em props das sections do
// template `pdp`. A composicao (quais sections, em que ordem) vem do manifest;
// aqui ha so props. Eixos de variacao, guia e tabela de specs vem de `catalog`
// e os rotulos de `vocabulary` (nada de nicho hardcoded).
import { buildAlt } from '@nears/ui';
import { getDepartments, getProducts } from '../data/client';
import { cardAspect, toProductCard } from '../data/mappers';
import type { Product } from '../data/schemas';
import { loadConfig, vocab, type NearsConfig } from '../manifest';
import type { SectionInstance } from './expand';

export const ADD_TO_CART_ENDPOINT = '/api/cart/items';

export type PdpView = {
  product: Product;
  /** Props cruas por instancia (null = pular a section). `quote`/`cep` entram no render dinamico. */
  propsFor: (instance: Pick<SectionInstance, 'id'>, extra?: { cep?: string; quote?: unknown }) => unknown | null;
  description: string;
  breadcrumb: { label: string; href?: string }[];
  faq: { question: string; answer: string }[];
};

const defaultFaq = (name: string) => [
  { question: `Qual o prazo de entrega de ${name}?`, answer: 'Informe o CEP na calculadora de frete desta página para ver o prazo e o valor exatos antes de comprar.' },
  { question: 'Posso trocar ou devolver?', answer: 'Sim. Você pode solicitar a troca ou a devolução em até 30 dias após o recebimento, pela página de trocas.' },
  { question: 'Quais formas de pagamento?', answer: 'Aceitamos cartão de crédito com parcelamento sem juros, Pix e boleto. As condições aparecem junto ao preço.' },
];

const firstParagraph = (text: string | undefined) => text?.split(/\n\s*\n/)[0]?.trim() ?? '';

export async function buildPdpView(slug: string, config: NearsConfig = loadConfig()): Promise<PdpView | null> {
  const [products, departments] = await Promise.all([getProducts(), getDepartments()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;

  const aspect = cardAspect(config);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const cards = (slugs: string[]) =>
    slugs.flatMap((s) => {
      const p = bySlug.get(s);
      return p && p.slug !== product.slug ? [toProductCard(p, { aspect })] : [];
    });

  const department = departments.find((d) => d.slug === product.department);
  const category = department?.categories.find((c) => c.slug === product.category);
  const subcategory = category?.subcategories.find((s) => s.slug === product.subcategory);
  const breadcrumb = [
    { label: 'Início', href: '/' },
    ...(department ? [{ label: department.name, href: `/${department.slug}` }] : []),
    ...(department && category ? [{ label: category.name, href: `/${department.slug}/${category.slug}` }] : []),
    ...(department && category && subcategory ? [{ label: subcategory.name, href: `/${department.slug}/${category.slug}/${subcategory.slug}` }] : []),
    { label: product.name },
  ];

  // Um seletor por eixo de catalog.variantAxes que o produto realmente oferece.
  const variantSelectors = config.catalog.variantAxes.flatMap((axis) => {
    const found = product.variants.find((v) => v.axis === axis.id);
    return found ? [{ id: axis.id, label: axis.label, display: axis.display, options: found.options }] : [];
  });

  const guideEnabled = config.catalog.guide.enabled && Boolean(product.guide);
  const guideLabel = config.catalog.guide.label ?? vocab('guide');

  const faq = product.faq ?? defaultFaq(product.name);

  const propsFor: PdpView['propsFor'] = (inst, extra) => {
    switch (inst.id) {
      case 'breadcrumb':
        return { items: breadcrumb };
      case 'pdp-gallery':
        return {
          images: product.images.map((img, i) => ({
            ...img,
            alt: `${buildAlt({ name: product.name, ...(product.brand ? { brand: product.brand } : {}) })}${i > 0 ? `, foto ${i + 1}` : ''}`,
          })),
          aspect,
        };
      case 'pdp-buybox':
        return {
          name: product.name,
          price: product.price,
          ...(product.listPrice ? { listPrice: product.listPrice } : {}),
          ...(product.installments ? { installments: product.installments } : {}),
          ...(product.rating ? { rating: product.rating } : {}),
          availability: product.availability,
          ...(product.sku ? { sku: product.sku } : {}),
          addToCartAction: ADD_TO_CART_ENDPOINT,
          variantSelectors,
          ...(guideEnabled ? { guideHref: '#guia' } : {}),
          cta: vocab('addToCart'),
          labels: { guide: `Ver ${guideLabel.toLowerCase()}`, added: vocab('addedToCart') },
        };
      case 'pdp-shipping':
        return { zipInput: true, ...(extra?.cep ? { cep: extra.cep } : {}), ...(extra?.quote ? { quote: extra.quote } : {}) };
      case 'pdp-details':
        return {
          ...(product.description ? { description: product.description } : {}),
          specs: config.catalog.specTable.enabled ? product.specs : [],
          ...(product.instructions ? { instructions: product.instructions } : {}),
          ...(guideEnabled && product.guide ? { guide: product.guide } : {}),
          labels: { guide: guideLabel },
        };
      case 'pdp-reviews':
        return { provider: 'nears', ...(product.rating ? { aggregate: { rating: product.rating.value, count: product.rating.count } } : {}), items: product.reviews };
      case 'pdp-bundle':
        return { title: vocab('bundle'), products: cards(product.bundle) };
      case 'pdp-related':
        return { products: cards(product.related) };
      case 'faq':
        return { title: 'Perguntas frequentes', items: faq };
      default:
        return null;
    }
  };

  return { product, propsFor, description: firstParagraph(product.description) || product.name, breadcrumb, faq };
}

