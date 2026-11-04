// Schema de nears/routes.manifest.yaml. Invariantes entre rotas e demais
// manifests (templates, slugs reservados, facetas) ficam em ../refs.ts.
import { z } from 'zod';

const positiveInt = z.number().int().positive();
const routeId = z.string().regex(/^[a-z][a-z0-9-]*$/, 'use kebab-case');

export const routeSchema = z.strictObject({
  id: routeId,
  pattern: z.string().startsWith('/'),
  template: z.string().min(1),
  source: z.enum(['cms', 'catalog', 'query-preset']).optional(),
  render: z.enum(['ssg', 'isr', 'csr']).optional(),
  revalidate: positiveInt.optional(),
  priority: z.number().min(0).max(1).optional(),
  /** Caminho do arquivo no App Router; null para arquivos especiais (not-found). */
  appRoute: z.string().startsWith('/').nullable(),
  jsBudgetCritical: z.boolean(),
  indexable: z.union([z.boolean(), z.literal('conditional')]).optional(),
  robots: z.string().optional(),
  headerVariant: z.enum(['full', 'minimal', 'none']).optional(),
  enabledBy: z.string().optional(),
  canonicalTo: routeId.optional(),
  required: z.boolean().optional(),
  scale: z.string().optional(),
  requires: z.array(z.string()).optional(),
  params: z.record(z.string(), z.looseObject({ type: z.string() })).optional(),
  schedule: z
    .strictObject({ startField: z.string(), endField: z.string(), onExpire: z.enum(['redirect', 'notfound']) })
    .optional(),
  note: z.string().optional(),
});

const segment = z.string().min(1).regex(/^[a-z0-9-]+$/, 'segmento em minusculas, sem "/" nem "*"');

export const routesSchema = z.strictObject({
  version: z.string(),
  defaults: z.strictObject({
    render: z.enum(['ssg', 'isr', 'csr']),
    revalidate: positiveInt,
    indexable: z.boolean(),
    headerVariant: z.enum(['full', 'minimal', 'none']),
  }),
  routes: z.array(routeSchema).min(1),
  resolution: z.strictObject({
    strategy: z.literal('slug-index'),
    literalSegmentsFirst: z.boolean(),
    slugIndex: z.strictObject({
      scope: z.literal('first-segment'),
      sources: z.array(z.strictObject({ route: routeId, from: z.enum(['cms', 'catalog']) })).min(1),
      onConflict: z.literal('fail-build'),
      onMiss: z.literal('not-found'),
      revalidate: positiveInt,
    }),
    secondSegment: z.record(z.string(), routeId),
    reserved: z.strictObject({ firstSegment: z.array(segment), secondSegment: z.array(segment) }),
  }),
  canonical: z.looseObject({ strategy: z.string() }),
  facets: z.strictObject({
    indexableFrom: z.string(),
    indexableAlone: z.boolean(),
    neverIndexable: z.array(z.string()),
    pagination: z.strictObject({
      strategy: z.literal('indexable-urls'),
      param: z.string(),
      firstPageCanonical: z.string(),
    }),
  }),
  excluded: z.strictObject({
    disallowSegments: z.array(segment),
    disallowPrefixes: z.array(z.string().startsWith('/').endsWith('/')),
  }),
  forbiddenInProduction: z.strictObject({ segments: z.array(segment), note: z.string().optional() }),
  sitemapXml: z.strictObject({
    enabled: z.boolean(),
    segmented: z.boolean(),
    maxUrlsPerFile: positiveInt,
    segments: z.array(z.string()).min(1),
  }),
});

export type Route = z.output<typeof routeSchema>;
export type RoutesManifest = z.output<typeof routesSchema>;
