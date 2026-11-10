// JSON-LD tipado (CLAUDE.md > SEO e GEO: nunca escrito a mao no JSX). Cada
// construtor devolve um no do schema.org; `graph()` junta os nos de uma pagina em
// um unico bloco `@graph`. Funcoes puras e sincronas: o contexto (URL da loja,
// entidade, politicas) entra por argumento, entao tudo e testavel sem rede.
import type { Organization, Policies, Product, Store } from '../data/schemas';
import { absoluteAsset, absoluteUrl } from './site';

export type JsonLd = { [key: string]: unknown };
export type SeoContext = { site: string; store: Store };
export type Crumb = { label: string; href?: string };

const CONTEXT = 'https://schema.org';

export const ids = (site: string) => ({
  organization: `${site}/#organization`,
  website: `${site}/#website`,
});

/** Junta nos em um unico bloco; `@context` so no topo. */
export function graph(...nodes: (JsonLd | null | undefined)[]): JsonLd {
  return { '@context': CONTEXT, '@graph': nodes.filter((n): n is JsonLd => Boolean(n)) };
}

const compact = (node: JsonLd): JsonLd => Object.fromEntries(Object.entries(node).filter(([, v]) => v !== undefined));

// ---------------------------------------------------------------- entidade

export function organizationNode({ site, store }: SeoContext): JsonLd {
  const o: Organization = store.organization;
  // Google pede logo >= 112x112; o do header e menor de proposito (ADR 0031).
  const orgLogo = store.organizationLogo ?? store.logo;
  return compact({
    '@type': 'Organization',
    '@id': ids(site).organization,
    name: store.name,
    legalName: o.legalName,
    url: site,
    description: o.description,
    logo: { '@type': 'ImageObject', url: absoluteAsset(orgLogo.src, site), width: orgLogo.width, height: orgLogo.height },
    foundingDate: o.foundingDate,
    taxID: o.taxId,
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.address.street,
      addressLocality: o.address.locality,
      addressRegion: o.address.region,
      postalCode: o.address.postalCode,
      addressCountry: o.address.country,
    },
    sameAs: o.sameAs,
    contactPoint: o.contactPoint ? compact({ '@type': 'ContactPoint', ...o.contactPoint }) : undefined,
  });
}

/** WebSite + SearchAction. `searchPath` vem do manifest (routes > search.pattern). */
export function websiteNode({ site, store }: SeoContext, searchPath: string): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': ids(site).website,
    url: site,
    name: store.name,
    publisher: { '@id': ids(site).organization },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl(searchPath, site)}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ----------------------------------------------------------- navegacao/lista

/** O ultimo item (pagina atual) nao tem href: usa a URL da propria pagina. */
export function breadcrumbNode(crumbs: Crumb[], currentPath: string, site: string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href ?? currentPath, site),
    })),
  };
}

export function itemListNode(items: { name: string; path: string }[], site: string): JsonLd {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(it.path, site), name: it.name })),
  };
}

export function collectionPageNode(
  { site }: SeoContext,
  page: { name: string; description: string; path: string; mainEntity?: JsonLd; breadcrumb?: JsonLd },
): JsonLd {
  const url = absoluteUrl(page.path, site);
  return compact({
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': ids(site).website },
    breadcrumb: page.breadcrumb,
    mainEntity: page.mainEntity,
  });
}

export function webPageNode({ site }: SeoContext, page: { name: string; description?: string; path: string; type?: 'WebPage' | 'AboutPage' }): JsonLd {
  const url = absoluteUrl(page.path, site);
  return compact({
    '@type': page.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': ids(site).website },
  });
}

/**
 * Loja fisica (ADR 0028, pagina publica /lojas). `openingHours` nao entra aqui:
 * e texto livre no fixture (ex.: "Seg a sáb, 10h às 22h"), e o formato
 * `openingHours`/`openingHoursSpecification` do schema.org exige dias/horas
 * estruturados - inventar essa estrutura a partir de um texto livre seria
 * dado factualmente incerto, nunca feito aqui (so aparece na pagina em HTML).
 */
export function localBusinessNode(store: { id: string; name: string; address: { street: string; number: string; neighborhood: string; city: string; state: string; postalCode: string }; geoCoordinates: { lat: number; lng: number } }, site: string): JsonLd {
  return {
    '@type': 'LocalBusiness',
    '@id': `${absoluteUrl('/lojas', site)}#${store.id}`,
    name: store.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${store.address.street}, ${store.address.number}`,
      addressLocality: store.address.city,
      addressRegion: store.address.state,
      postalCode: store.address.postalCode,
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: store.geoCoordinates.lat, longitude: store.geoCoordinates.lng },
  };
}

export function faqNode(items: { question: string; answer: string }[]): JsonLd | null {
  if (items.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
  };
}

// ------------------------------------------------------------------ produto

const AVAILABILITY = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
} as const;

const RETURN_METHOD = { ByMail: 'https://schema.org/ReturnByMail', InStore: 'https://schema.org/ReturnInStore', AtKiosk: 'https://schema.org/ReturnAtKiosk' } as const;
const RETURN_FEES = {
  FreeReturn: 'https://schema.org/FreeReturn',
  ReturnShippingFees: 'https://schema.org/ReturnShippingFees',
  RestockingFees: 'https://schema.org/RestockingFees',
} as const;

const money = (value: number) => value.toFixed(2);
const days = (range: { min: number; max: number }): JsonLd => ({ '@type': 'QuantitativeValue', minValue: range.min, maxValue: range.max, unitCode: 'DAY' });

export function shippingDetailsNode(policies: Policies['shipping'], price: number): JsonLd {
  const free = policies.freeFrom !== undefined && price >= policies.freeFrom;
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: money(free ? 0 : policies.rate), currency: 'BRL' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: policies.country },
    deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: days(policies.handlingDays), transitTime: days(policies.transitDays) },
  };
}

export function returnPolicyNode(policies: Policies['returns'], country: string): JsonLd {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: country,
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: policies.days,
    returnMethod: RETURN_METHOD[policies.method],
    returnFees: RETURN_FEES[policies.fees],
  };
}

export type ProductJsonLdInput = {
  product: Product;
  /** Caminho canonico da PDP. */
  path: string;
  breadcrumb: Crumb[];
};

/**
 * Product completo (contracts.yaml > data.product). Campos GEO que o dado nao
 * fornece sao OMITIDOS aqui (nunca inventados) e reportados por `missingGeoFields`.
 */
export function productNode({ site, store }: SeoContext, { product, path, breadcrumb }: ProductJsonLdInput): JsonLd {
  const url = absoluteUrl(path, site);
  const description = product.description?.split(/\n\s*\n/).join(' ').trim();
  return compact({
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    url,
    sku: product.sku,
    gtin: product.gtin,
    description,
    image: product.images.map((i) => absoluteAsset(i.src, site)),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: breadcrumb.slice(1, -1).map((c) => c.label).join(' > ') || undefined,
    additionalProperty: product.specs.length ? product.specs.map((s) => ({ '@type': 'PropertyValue', name: s.name, value: s.value })) : undefined,
    aggregateRating: product.rating
      ? { '@type': 'AggregateRating', ratingValue: product.rating.value, reviewCount: product.rating.count, bestRating: 5, worstRating: 1 }
      : undefined,
    review: product.reviews.length
      ? product.reviews.map((r) =>
          compact({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            datePublished: r.date.slice(0, 10),
            name: r.title,
            reviewBody: r.body,
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          }),
        )
      : undefined,
    offers: compact({
      '@type': 'Offer',
      url,
      price: money(product.price),
      priceCurrency: 'BRL',
      availability: AVAILABILITY[product.availability],
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: product.priceValidUntil,
      seller: { '@id': ids(site).organization },
      shippingDetails: shippingDetailsNode(store.policies.shipping, product.price),
      hasMerchantReturnPolicy: returnPolicyNode(store.policies.returns, store.policies.shipping.country),
    }),
  });
}
