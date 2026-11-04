// Schema de nears/nears.config.yaml. `catalog` e `vocabulary` sao os dois blocos
// que mudam por nicho (docs/adr/0002); o restante e infraestrutura da plataforma.
import { z } from 'zod';

/** Identificador camelCase usado em eixos, facetas e atributos (ex.: `skinType`). */
export const identifier = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, 'use camelCase alfanumerico (ex.: skinType)');

const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'use MAJOR.MINOR.PATCH');

export const variantAxisSchema = z.strictObject({
  id: identifier,
  label: z.string().min(1),
  /** swatch (amostra visual) ou option (texto). Ambos sao radiogroup (CLAUDE.md). */
  display: z.enum(['swatch', 'option']),
  /** Propriedade schema.org correspondente (ex.: color, size). */
  schemaOrg: z.string().min(1).optional(),
});

export const catalogSchema = z
  .strictObject({
    vertical: z.string().min(1).default('generic'),
    productMedia: z.strictObject({
      /** Chave de tokens.json > media.aspect (conferida em refs.ts). */
      aspect: z.string().min(1),
      hoverImage: z.boolean().default(false),
    }),
    variantAxes: z.array(variantAxisSchema).default([]),
    facets: z.strictObject({
      available: z.array(identifier).min(1),
      indexable: z.array(identifier).default([]),
    }),
    geoAttributes: z.array(identifier).default([]),
    specTable: z.strictObject({ enabled: z.boolean() }).default({ enabled: true }),
    guide: z
      .strictObject({ enabled: z.boolean(), label: z.string().min(1).nullable().default(null) })
      .default({ enabled: false, label: null }),
    flatAxis: z
      .strictObject({ enabled: z.boolean(), secondLevelAttribute: identifier.nullable().default(null) })
      .default({ enabled: true, secondLevelAttribute: null }),
  })
  .superRefine((c, ctx) => {
    const seen = new Set<string>();
    c.variantAxes.forEach((axis, i) => {
      if (seen.has(axis.id)) {
        ctx.addIssue({ code: 'custom', path: ['variantAxes', i, 'id'], message: `eixo "${axis.id}" duplicado` });
      }
      seen.add(axis.id);
    });
    c.facets.indexable.forEach((f, i) => {
      if (!c.facets.available.includes(f)) {
        ctx.addIssue({
          code: 'custom',
          path: ['facets', 'indexable', i],
          message: `faceta indexavel "${f}" precisa estar em facets.available`,
        });
      }
    });
    if (c.guide.enabled && !c.guide.label) {
      ctx.addIssue({ code: 'custom', path: ['guide', 'label'], message: 'guide.enabled exige guide.label' });
    }
    if (!c.flatAxis.enabled && c.flatAxis.secondLevelAttribute) {
      ctx.addIssue({
        code: 'custom',
        path: ['flatAxis', 'secondLevelAttribute'],
        message: 'secondLevelAttribute so faz sentido com flatAxis.enabled: true',
      });
    }
  });

/** Chaves que o codigo le. Presets podem sobrescrever o texto, nunca remover a chave. */
export const REQUIRED_VOCABULARY_KEYS = [
  'cart',
  'addToCart',
  'wishlist',
  'department',
  'productType',
  'bundle',
  'guide',
  'search',
  'searchLabel',
  'searchPlaceholder',
  'searchSubmit',
  'searchEmpty',
  'searchNoResults',
  'searchNoResultsHint',
] as const;

export const vocabularySchema = z
  .record(identifier, z.string().min(1, 'texto vazio'))
  .superRefine((v, ctx) => {
    for (const key of REQUIRED_VOCABULARY_KEYS) {
      if (!(key in v)) ctx.addIssue({ code: 'custom', path: [key], message: `chave obrigatoria "${key}" ausente` });
    }
  });

const positiveInt = z.number().int().positive();

export const budgetsSchema = z.strictObject({
  js_initial_kb: z.number().positive(),
  css_initial_kb: z.number().positive(),
  html_kb: z.number().positive(),
  requests_initial: positiveInt,
  third_party_hosts: positiveInt,
  third_party_js_kb: z.number().positive(),
  lcp_ms: positiveInt,
  inp_ms: positiveInt,
  cls: z.number().positive(),
  ttfb_ms: positiveInt,
  onExceed: z.enum(['fail', 'warn']),
});

export const configSchema = z.strictObject({
  platform: z.string().min(1),
  template: z.string().min(1),
  version: semver,
  catalog: catalogSchema,
  vocabulary: vocabularySchema,
  locale: z
    .strictObject({ default: z.string().min(2), supported: z.array(z.string().min(2)).min(1) })
    .refine((l) => l.supported.includes(l.default), 'locale.default precisa estar em locale.supported'),
  currency: z.string().length(3),
  timezone: z.string().min(1),
  rendering: z.looseObject({
    engine: z.literal('next'),
    mode: z.string().min(1),
    revalidate: positiveInt,
    streaming: z.boolean(),
    cacheComponents: z.boolean(),
    partialPrefetching: z.boolean(),
  }),
  design: z.looseObject({
    tokens: z.looseObject({ source: z.string().min(1) }),
    typography: z.looseObject({
      licenses: z.array(z.string()).min(1),
      hosting: z.literal('self-hosted'),
      maxFamilies: z.literal(1),
    }),
    breakpoints: z.record(z.string(), positiveInt),
  }),
  composition: z.strictObject({ home: z.strictObject({ featuredDepartments: positiveInt }) }),
  budgets: budgetsSchema,
  accessibility: z.strictObject({
    standard: z.string().min(1),
    minTouchTarget: z.number().min(44, 'WCAG 2.2: alvo de toque minimo 44px (CLAUDE.md)'),
    axeViolationsAllowed: z.literal(0),
    keyboardPathRequired: z.boolean(),
    reducedMotionRequired: z.boolean(),
  }),
  security: z.looseObject({
    headers: z.looseObject({
      hsts: z.strictObject({
        enabled: z.boolean(),
        maxAgeSeconds: positiveInt,
        includeSubDomains: z.boolean(),
        preload: z.boolean(),
      }),
      xContentTypeOptions: z.string().min(1),
      referrerPolicy: z.string().min(1),
      permissionsPolicy: z.string().min(1),
      frameAncestors: z.enum(['none', 'self']),
    }),
    multiTenancy: z.looseObject({ hostValidation: z.literal('allowlist-only') }),
  }),
  integrations: z.record(z.string(), z.record(z.string(), z.unknown())),
});

/** Preset de nicho (nears/presets/*.yaml): substitui `catalog` e mescla `vocabulary`. */
export const presetSchema = z.strictObject({
  preset: identifier,
  description: z.string().min(1),
  catalog: z.record(z.string(), z.unknown()),
  vocabulary: z.record(identifier, z.string().min(1)).default({}),
});

export type Catalog = z.output<typeof catalogSchema>;
export type VariantAxis = z.output<typeof variantAxisSchema>;
export type Vocabulary = z.output<typeof vocabularySchema>;
export type NearsConfig = z.output<typeof configSchema>;
export type Preset = z.output<typeof presetSchema>;
