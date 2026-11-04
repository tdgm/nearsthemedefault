import { z } from 'zod';

/** Schema de nears/contracts.yaml - contratos de dados, SEO e GEO por template. */

const productContractSchema = z.object({
  required: z.array(z.string().min(1)).min(1),
  offers: z.object({
    required: z.array(z.string().min(1)).min(1),
  }),
  requiredForGeo: z.array(z.string().min(1)),
  requiredForGeoFrom: z.string().min(1),
  variants: z.object({
    isVariantOf: z.record(z.string(), z.string()),
    variesBy: z.string().min(1),
    hasVariant: z.string().min(1),
  }),
  onMissingGeoField: z.string().min(1),
});

const dataSchema = z.object({
  product: productContractSchema,
  collection: z.object({
    required: z.array(z.string().min(1)).min(1),
    requiredForGeo: z.array(z.string().min(1)),
  }),
  organization: z.object({
    required: z.array(z.string().min(1)).min(1),
    optional: z.array(z.string().min(1)),
  }),
});

const seoGlobalSchema = z.object({
  canonical: z.string().min(1),
  titleTemplate: z.string().min(1),
  descriptionMaxChars: z.number().int().positive(),
  openGraph: z.object({
    required: z.array(z.string().min(1)).min(1),
    imageSize: z.string().min(1),
  }),
  twitter: z.object({ card: z.string().min(1) }),
  robotsDefault: z.string().min(1),
  headings: z.object({
    h1PerPage: z.literal(1),
    skipLevels: z.string().min(1),
  }),
  altText: z.object({
    strategy: z.string().min(1),
    pattern: z.string().min(1),
  }),
  noJsRender: z.string().min(1),
});

const seoByTemplateSchema = z.object({
  h1: z.string().min(1).optional(),
  schema: z.array(z.string().min(1)).optional(),
  robots: z.string().min(1).optional(),
  requires: z.array(z.string().min(1)).optional(),
});

const seoSchema = z.object({
  global: seoGlobalSchema,
  byTemplate: z.record(z.string(), seoByTemplateSchema),
});

const geoSchema = z.object({
  requiredEverywhere: z.record(z.string(), z.boolean()),
  entity: z.object({
    organization: z.array(z.string().min(1)).min(1),
    napConsistency: z.string().min(1),
  }),
  coverage: z.object({
    faqOnCollections: z.number().min(0).max(1),
    faqOnPdp: z.number().min(0).max(1),
    productSchemaCompleteness: z.number().min(0).max(1),
  }),
  files: z.object({
    robotsTxt: z.string().min(1),
    llmsTxt: z.string().min(1),
  }),
  // Valores de negocio, nao tecnicos ("allow" | "decide" por enquanto) -
  // ver docs/PROMPTS.md > Decisoes de negocio.
  agents: z.record(z.string(), z.string()),
  attribution: z.object({
    trackAiReferrals: z.boolean(),
    referrerPatterns: z.array(z.string().min(1)),
  }),
});

const contrastPairSchema = z.object({
  fg: z.string().min(1),
  bg: z.array(z.string().min(1)).min(1),
  min: z.string().min(1),
});

const gatesSchema = z.object({
  performance: z.object({
    lighthouseMobile: z.record(z.string(), z.number()),
    cruxP75: z.record(z.string(), z.number()),
    budgets: z.string().min(1),
  }),
  accessibility: z.object({
    wcag: z.string().min(1),
    keyboardPath: z.string().min(1),
    axeViolations: z.number().int().nonnegative(),
    contrastPairs: z.array(contrastPairSchema).min(1),
    contrastMin: z.record(z.string(), z.number()),
  }),
  security: z.object({
    headers: z.string().min(1),
    dependencyAudit: z.string().min(1),
    secretScanning: z.string().min(1),
    staticAnalysis: z.string().min(1),
    multiTenancyHostValidation: z.string().min(1),
  }),
  seo: z.object({
    richResultsErrors: z.number().int().nonnegative(),
    templatesChecked: z.array(z.string().min(1)),
    noJsIndexableContent: z.string().min(1),
    orphanPages: z.number().int().nonnegative(),
  }),
  geo: z.object({
    faqCoverage: z.number().min(0).max(1),
    productSchemaCompleteness: z.number().min(0).max(1),
    llmsTxt: z.string().min(1),
  }),
  governance: z.object({
    everySectionDeclares: z.array(z.string().min(1)).min(1),
    noHardcodedBrandValues: z.boolean(),
    storybookCoverage: z.number().min(0).max(1),
  }),
});

export const contractsSchema = z.object({
  version: z.string().min(1),
  data: dataSchema,
  seo: seoSchema,
  geo: geoSchema,
  gates: gatesSchema,
});

export type Contracts = z.infer<typeof contractsSchema>;
