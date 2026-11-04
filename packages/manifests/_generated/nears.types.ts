// GERADO por `pnpm manifests:types` a partir de /nears. Nao edite.
// Nicho configurado: generic. Alterou um manifest? Rode o comando e
// commite este arquivo (`pnpm manifests:check` falha se divergir).

/** Eixos de variacao do SKU, na ordem da PDP (catalog.variantAxes). */
export const variantAxes = [] as const;
export type VariantAxisId = (typeof variantAxes)[number]['id'];

export const facetIds = ["category", "brand", "price"] as const;
export type FacetId = (typeof facetIds)[number];

export const indexableFacetIds = ["category", "brand"] as const;
export type IndexableFacetId = (typeof indexableFacetIds)[number];

export const geoAttributeIds = [] as const;
export type GeoAttributeId = (typeof geoAttributeIds)[number];

export const vocabularyKeys = ["cart", "addToCart", "wishlist", "department", "productType", "bundle", "guide", "search", "searchLabel", "searchPlaceholder", "searchSubmit", "searchEmpty", "searchNoResults", "searchNoResultsHint"] as const;
export type VocabularyKey = (typeof vocabularyKeys)[number];

export const sectionIds = ["hero", "benefit-bar", "section-title", "banner-grid", "category-hub", "showcase", "event-banner", "banner-full", "quick-filter", "product-grid", "product-card", "breadcrumb", "text-seo", "faq", "related-links", "pdp-gallery", "pdp-buybox", "pdp-shipping", "pdp-details", "pdp-reviews", "pdp-bundle", "pdp-related"] as const;
export type SectionId = (typeof sectionIds)[number];

export const routeIds = ["home", "department", "department-category", "department-category-sub", "category-flat", "category-flat-attribute", "longtail", "campaign", "campaign-segment", "pdp", "search", "institutional", "sitemap-html", "not-found"] as const;
export type RouteId = (typeof routeIds)[number];

export const templateIds = ["home", "collection", "pdp", "landing", "page", "search", "sitemap", "notfound"] as const;
export type TemplateId = (typeof templateIds)[number];

/** Recursos ligados ou desligados no nicho. */
export const catalogFlags = {
  vertical: "generic",
  productMediaAspect: "product",
  hoverImage: false,
  specTable: true,
  guide: false,
  guideLabel: null,
  flatAxis: true,
  flatAxisSecondLevelAttribute: null,
} as const;
