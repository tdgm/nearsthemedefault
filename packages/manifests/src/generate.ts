// Gera _generated/nears.types.ts a partir dos manifests da loja: unioes de
// eixos de variacao, facetas, atributos GEO, vocabulario, sections e rotas.
// Determinístico (sem data/hora) para o `--check` do CI comparar byte a byte.
import type { Manifests } from './manifests.ts';

const literal = (items: readonly string[]) => `[${items.map((i) => JSON.stringify(i)).join(', ')}] as const`;

export function generateTypes(m: Manifests): string {
  const { catalog, vocabulary } = m.config;
  const allSections = [...m.sections.sections, ...m.sections.pdpSections];
  const axes = JSON.stringify(catalog.variantAxes, null, 2);

  return `// GERADO por \`pnpm manifests:types\` a partir de /nears. Nao edite.
// Nicho configurado: ${catalog.vertical}. Alterou um manifest? Rode o comando e
// commite este arquivo (\`pnpm manifests:check\` falha se divergir).

/** Eixos de variacao do SKU, na ordem da PDP (catalog.variantAxes). */
export const variantAxes = ${axes} as const;
export type VariantAxisId = (typeof variantAxes)[number]['id'];

export const facetIds = ${literal(catalog.facets.available)};
export type FacetId = (typeof facetIds)[number];

export const indexableFacetIds = ${literal(catalog.facets.indexable)};
export type IndexableFacetId = (typeof indexableFacetIds)[number];

export const geoAttributeIds = ${literal(catalog.geoAttributes)};
export type GeoAttributeId = (typeof geoAttributeIds)[number];

export const vocabularyKeys = ${literal(Object.keys(vocabulary))};
export type VocabularyKey = (typeof vocabularyKeys)[number];

export const sectionIds = ${literal(allSections.map((s) => s.id))};
export type SectionId = (typeof sectionIds)[number];

export const routeIds = ${literal(m.routes.routes.map((r) => r.id))};
export type RouteId = (typeof routeIds)[number];

export const templateIds = ${literal(Object.keys(m.sections.templates))};
export type TemplateId = (typeof templateIds)[number];

/** Recursos ligados ou desligados no nicho. */
export const catalogFlags = {
  vertical: ${JSON.stringify(catalog.vertical)},
  productMediaAspect: ${JSON.stringify(catalog.productMedia.aspect)},
  hoverImage: ${catalog.productMedia.hoverImage},
  specTable: ${catalog.specTable.enabled},
  guide: ${catalog.guide.enabled},
  guideLabel: ${JSON.stringify(catalog.guide.label)},
  flatAxis: ${catalog.flatAxis.enabled},
  flatAxisSecondLevelAttribute: ${JSON.stringify(catalog.flatAxis.secondLevelAttribute)},
} as const;
`;
}
