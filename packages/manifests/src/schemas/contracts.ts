// Schema de nears/contracts.yaml - contratos de dados, SEO e GEO por template,
// e os gates (performance/a11y/seguranca/SEO/GEO/governanca) lidos por scripts.
// Tipado por completo (CLAUDE.md > Codigo: "Zod para validar todo manifest") -
// nao so os campos que o codigo ja le hoje.
import { z } from 'zod';

const strings = z.array(z.string().min(1));

export const contrastPairSchema = z.strictObject({
  fg: z.string().min(1),
  bg: z.array(z.string().min(1)).min(1),
  min: z.enum(['text', 'ui']),
});

const productContractSchema = z.strictObject({
  required: strings.min(1),
  offers: z.strictObject({ required: strings.min(1) }),
  requiredForGeo: strings,
  requiredForGeoFrom: z.string().min(1),
  variants: z.strictObject({
    isVariantOf: z.record(z.string(), z.string()),
    variesBy: z.string().min(1),
    hasVariant: z.string().min(1),
  }),
  onMissingGeoField: z.enum(['warn-build', 'fail-build']),
});

// Cliente, pedido e loja fisica (Fase 9, ADR 0027/0028). Nunca indexavel nem GEO:
// dados pessoais ou operacionais, nao conteudo de catalogo.
const addressFieldsSchema = z.strictObject({ required: strings.min(1), optional: strings });

const customerContractSchema = z.strictObject({
  required: strings.min(1),
  optional: strings,
  addresses: addressFieldsSchema,
});

const orderContractSchema = z.strictObject({
  required: strings.min(1),
  items: z.strictObject({ required: strings.min(1) }),
  status: strings.min(1),
});

// Favoritos/wishlist (Fase 9c, ADR 0027). So referencia um sku do catalogo -
// diferente de order.items, que e um snapshot congelado no momento da compra.
const favoriteContractSchema = z.strictObject({
  required: strings.min(1),
});

const storeContractSchema = z.strictObject({
  required: strings.min(1),
  optional: strings,
  note: z.string().min(1),
});

// Estoque granular por loja (ADR 0028 "fulfillment por loja"), nao o MOI real da
// VTEX (ver correcao na ADR 0028 - MOI resolve marketplace multi-seller, nao
// fulfillment por loja). So relevante quando fulfillment.inventory.mode =
// "per-store" (nears.config.yaml); com "shared" o estoque e um pool unico.
const storeInventoryContractSchema = z.strictObject({
  required: strings.min(1),
  note: z.string().min(1),
});

const dataSchema = z.strictObject({
  product: productContractSchema,
  collection: z.strictObject({ required: strings.min(1), requiredForGeo: strings }),
  organization: z.strictObject({ required: strings.min(1), optional: strings }),
  customer: customerContractSchema,
  order: orderContractSchema,
  favorite: favoriteContractSchema,
  store: storeContractSchema,
  storeInventory: storeInventoryContractSchema,
});

const seoGlobalSchema = z.strictObject({
  canonical: z.string().min(1),
  titleTemplate: z.string().min(1),
  descriptionMaxChars: z.number().int().positive(),
  openGraph: z.strictObject({ required: strings.min(1), imageSize: z.string().min(1) }),
  twitter: z.strictObject({ card: z.string().min(1) }),
  robotsDefault: z.string().min(1),
  headings: z.strictObject({ h1PerPage: z.literal(1), skipLevels: z.string().min(1) }),
  altText: z.strictObject({ strategy: z.string().min(1), pattern: z.string().min(1) }),
  noJsRender: z.string().min(1),
});

const seoByTemplateSchema = z.strictObject({
  h1: z.string().min(1).optional(),
  schema: strings.optional(),
  robots: z.string().min(1).optional(),
  requires: strings.optional(),
});

const seoSchema = z.strictObject({
  global: seoGlobalSchema,
  byTemplate: z.record(z.string(), seoByTemplateSchema),
});

const geoSchema = z.strictObject({
  requiredEverywhere: z.record(z.string(), z.boolean()),
  entity: z.strictObject({ organization: strings.min(1), napConsistency: z.string().min(1) }),
  coverage: z.strictObject({
    faqOnCollections: z.number().min(0).max(1),
    faqOnPdp: z.number().min(0).max(1),
    productSchemaCompleteness: z.number().min(0).max(1),
  }),
  files: z.strictObject({ robotsTxt: z.string().min(1), llmsTxt: z.string().min(1) }),
  // Decisao de negocio, nao tecnica (docs/PROMPTS.md > Decisoes de negocio).
  agents: z.record(z.string(), z.enum(['allow', 'disallow', 'decide'])),
  attribution: z.strictObject({ trackAiReferrals: z.boolean(), referrerPatterns: strings }),
});

const gatesSchema = z.strictObject({
  performance: z.strictObject({
    lighthouseMobile: z.record(z.string(), z.number()),
    cruxP75: z.record(z.string(), z.number()),
    budgets: z.string().min(1),
  }),
  accessibility: z.strictObject({
    wcag: z.string().min(1),
    keyboardPath: z.string().min(1),
    axeViolations: z.number().int().nonnegative(),
    // Lido por `pnpm tokens:contrast` direto do YAML (sem passar por este
    // schema) - cada par e checado nos dois temas; falha o build se algum
    // ficar abaixo do minimo.
    contrastPairs: z.array(contrastPairSchema).min(1),
    contrastMin: z.strictObject({ text: z.number().min(4.5), ui: z.number().min(3) }),
  }),
  security: z.strictObject({
    headers: z.string().min(1),
    dependencyAudit: z.string().min(1),
    secretScanning: z.string().min(1),
    staticAnalysis: z.string().min(1),
    multiTenancyHostValidation: z.string().min(1),
  }),
  seo: z.strictObject({
    richResultsErrors: z.number().int().nonnegative(),
    templatesChecked: strings,
    noJsIndexableContent: z.string().min(1),
    orphanPages: z.number().int().nonnegative(),
  }),
  geo: z.strictObject({
    faqCoverage: z.number().min(0).max(1),
    productSchemaCompleteness: z.number().min(0).max(1),
    llmsTxt: z.string().min(1),
  }),
  governance: z.strictObject({
    everySectionDeclares: strings.min(1),
    noHardcodedBrandValues: z.boolean(),
    storybookCoverage: z.number().min(0).max(1),
  }),
});

export const contractsSchema = z.strictObject({
  version: z.string().min(1),
  data: dataSchema,
  seo: seoSchema,
  geo: geoSchema,
  gates: gatesSchema,
});

export type ContrastPair = z.output<typeof contrastPairSchema>;
export type Contracts = z.output<typeof contractsSchema>;
