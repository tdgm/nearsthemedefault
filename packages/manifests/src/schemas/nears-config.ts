import { z } from 'zod';

/**
 * Schema de nears/nears.config.yaml. Cobre tudo o que varia por marca
 * (design.*) e por nicho (catalog, vocabulary) - CLAUDE.md > "O que e este
 * projeto". `vocabulary` e deliberadamente aberto (Record<string, string>):
 * cada nicho/marca pode adicionar microcopy sem precisar editar o schema.
 */

const variantAxisSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  display: z.enum(['swatch', 'option']),
  schemaOrg: z.string().min(1).optional(),
});

const catalogSchema = z.object({
  vertical: z.string().min(1),
  productMedia: z.object({
    aspect: z.string().min(1),
    hoverImage: z.boolean(),
  }),
  variantAxes: z.array(variantAxisSchema),
  facets: z.object({
    available: z.array(z.string().min(1)),
    indexable: z.array(z.string().min(1)),
  }),
  geoAttributes: z.array(z.string().min(1)),
  specTable: z.object({ enabled: z.boolean() }),
  guide: z.object({
    enabled: z.boolean(),
    label: z.string().min(1).nullable(),
  }),
  flatAxis: z.object({
    enabled: z.boolean(),
    secondLevelAttribute: z.string().min(1).nullable(),
  }),
});

const vocabularySchema = z.record(z.string(), z.string());

const localeSchema = z.object({
  default: z.string().min(1),
  supported: z.array(z.string().min(1)).min(1),
});

const renderingSchema = z.object({
  engine: z.string().min(1),
  mode: z.string().min(1),
  revalidate: z.number().int().nonnegative(),
  dataLayer: z.string().min(1),
  endpoint: z.string().min(1),
  streaming: z.boolean(),
  cacheComponents: z.boolean(),
  partialPrefetching: z.boolean(),
});

const typographySchema = z.object({
  licenses: z.array(z.string().min(1)).min(1),
  hosting: z.literal('self-hosted'),
  maxFamilies: z.number().int().positive(),
  weights: z.array(z.number().int()).min(1),
  preload: z.array(z.number().int()),
  display: z.string().min(1),
  subset: z.array(z.string().min(1)),
  fallback: z.object({
    adjust: z.string().min(1),
    stack: z.string().min(1),
  }),
});

const designSchema = z.object({
  theme: z.string().min(1),
  tokens: z.object({
    source: z.string().min(1),
    output: z.array(z.string().min(1)),
  }),
  typography: typographySchema,
  color: z.object({
    scales: z.array(z.string().min(1)),
    semantic: z.array(z.string().min(1)),
    themes: z.array(z.string().min(1)).min(1),
  }),
  space: z.object({
    base: z.number().int().positive(),
    scale: z.array(z.number().nonnegative()),
  }),
  radius: z.array(z.string().min(1)),
  breakpoints: z.object({
    xs: z.number().int().positive(),
    sm: z.number().int().positive(),
    md: z.number().int().positive(),
    lg: z.number().int().positive(),
    xl: z.number().int().positive(),
  }),
  motion: z.object({
    durations: z.array(z.number().int().nonnegative()),
    respectsReducedMotion: z.boolean(),
  }),
});

const compositionSchema = z.object({
  home: z.object({
    featuredDepartments: z.number().int().positive(),
  }),
});

const budgetsSchema = z.object({
  js_initial_kb: z.number().positive(),
  css_initial_kb: z.number().positive(),
  html_kb: z.number().positive(),
  requests_initial: z.number().int().positive(),
  third_party_hosts: z.number().int().positive(),
  third_party_js_kb: z.number().positive(),
  lcp_ms: z.number().positive(),
  inp_ms: z.number().positive(),
  cls: z.number().positive(),
  ttfb_ms: z.number().positive(),
  onExceed: z.enum(['fail', 'warn']),
});

const accessibilitySchema = z.object({
  standard: z.string().min(1),
  minTouchTarget: z.number().positive(),
  axeViolationsAllowed: z.number().int().nonnegative(),
  keyboardPathRequired: z.boolean(),
  reducedMotionRequired: z.boolean(),
});

const securitySchema = z.object({
  headers: z.object({
    contentSecurityPolicy: z.object({
      mode: z.string().min(1),
      reportOnly: z.boolean(),
    }),
    hsts: z.object({
      enabled: z.boolean(),
      maxAgeSeconds: z.number().int().positive(),
      includeSubDomains: z.boolean(),
      preload: z.boolean(),
    }),
    xContentTypeOptions: z.string().min(1),
    referrerPolicy: z.string().min(1),
    permissionsPolicy: z.string().min(1),
    frameAncestors: z.string().min(1),
  }),
  dependencies: z.object({
    lockfileRequired: z.boolean(),
    auditLevel: z.string().min(1),
  }),
  multiTenancy: z.object({
    hostValidation: z.string().min(1),
    allowlistSource: z.string().min(1),
  }),
});

const providerIntegrationSchema = z.object({
  provider: z.string().min(1).nullable(),
});

const integrationsSchema = z.object({
  tagManager: z.object({
    mode: z.string().min(1),
    required: z.boolean(),
    loadStrategy: z.string().min(1),
  }),
  analytics: providerIntegrationSchema.extend({
    loadStrategy: z.string().min(1),
  }),
  reviews: providerIntegrationSchema.extend({
    schema: z.string().min(1),
    ssr: z.boolean(),
  }),
  personalization: providerIntegrationSchema.extend({
    loadStrategy: z.string().min(1),
    ssrFallback: z.string().min(1),
  }),
  search: providerIntegrationSchema.extend({
    autocomplete: z.boolean(),
    indexable: z.boolean(),
  }),
  consent: providerIntegrationSchema.extend({
    blocking: z.boolean(),
    reservedHeight: z.number().nonnegative(),
  }),
  thirdPartyPolicy: z.object({
    sandbox: z.string().min(1),
    requiresAdr: z.boolean(),
  }),
});

export const nearsConfigSchema = z.object({
  platform: z.string().min(1),
  template: z.string().min(1),
  version: z.string().min(1),
  catalog: catalogSchema,
  vocabulary: vocabularySchema,
  locale: localeSchema,
  currency: z.string().min(1),
  timezone: z.string().min(1),
  rendering: renderingSchema,
  design: designSchema,
  composition: compositionSchema,
  budgets: budgetsSchema,
  accessibility: accessibilitySchema,
  security: securitySchema,
  integrations: integrationsSchema,
});

export type NearsConfig = z.infer<typeof nearsConfigSchema>;
export type Catalog = z.infer<typeof catalogSchema>;
export type VariantAxis = z.infer<typeof variantAxisSchema>;
