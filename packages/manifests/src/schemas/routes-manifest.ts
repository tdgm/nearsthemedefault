import { z } from 'zod';

/** Schema de nears/routes.manifest.yaml - ver docs/adr/0003 para o porque da forma. */

const routeParamSchema = z.object({
  type: z.string().min(1),
  from: z.string().min(1).optional(),
});

const scheduleSchema = z.object({
  startField: z.string().min(1),
  endField: z.string().min(1),
  onExpire: z.string().min(1),
});

/** `indexable` e booleano na maioria das rotas, mas "conditional" em landings. */
const indexableSchema = z.union([z.boolean(), z.literal('conditional')]);

const routeSchema = z.object({
  id: z.string().min(1),
  pattern: z.string().min(1),
  template: z.string().min(1),
  render: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  priority: z.number().min(0).max(1).optional(),
  // null = pagina especial do Next fora do mapa (ex.: app/not-found.tsx).
  appRoute: z.string().min(1).nullable(),
  jsBudgetCritical: z.boolean(),
  params: z.record(z.string(), routeParamSchema).optional(),
  enabledBy: z.string().min(1).optional(),
  note: z.string().optional(),
  indexable: indexableSchema.optional(),
  canonicalTo: z.string().min(1).optional(),
  scale: z.string().min(1).optional(),
  requires: z.array(z.string().min(1)).optional(),
  schedule: scheduleSchema.optional(),
  robots: z.string().min(1).optional(),
  required: z.boolean().optional(),
  headerVariant: z.string().min(1).optional(),
});

const defaultsSchema = z.object({
  render: z.string().min(1),
  revalidate: z.number().int().nonnegative(),
  indexable: z.boolean(),
  headerVariant: z.string().min(1),
});

const resolutionSchema = z.object({
  strategy: z.string().min(1),
  literalSegmentsFirst: z.boolean(),
  slugIndex: z.object({
    scope: z.string().min(1),
    sources: z.array(
      z.object({
        route: z.string().min(1),
        from: z.string().min(1),
      }),
    ),
    onConflict: z.string().min(1),
    onMiss: z.string().min(1),
    revalidate: z.number().int().nonnegative(),
  }),
  secondSegment: z.record(z.string(), z.string()),
  reserved: z.object({
    firstSegment: z.array(z.string().min(1)),
    secondSegment: z.array(z.string().min(1)),
  }),
});

const canonicalSchema = z.object({
  strategy: z.string().min(1),
  rules: z.array(
    z.object({
      when: z.string().min(1),
      canonicalTo: z.string().min(1).optional(),
      reason: z.string().optional(),
      stripParams: z.boolean().optional(),
      robots: z.string().optional(),
    }),
  ),
});

const facetsSchema = z.object({
  indexableFrom: z.string().min(1),
  indexableAlone: z.boolean(),
  neverIndexable: z.array(z.string().min(1)),
  pagination: z.object({
    strategy: z.string().min(1),
    param: z.string().min(1),
    firstPageCanonical: z.string().min(1),
  }),
});

const excludedSchema = z.object({
  disallowSegments: z.array(z.string().min(1)),
  disallowPrefixes: z.array(z.string().min(1)),
});

const forbiddenInProductionSchema = z.object({
  segments: z.array(z.string().min(1)),
  note: z.string().optional(),
});

const sitemapXmlSchema = z.object({
  enabled: z.boolean(),
  segmented: z.boolean(),
  maxUrlsPerFile: z.number().int().positive(),
  segments: z.array(z.string().min(1)),
});

export const routesManifestSchema = z.object({
  version: z.string().min(1),
  defaults: defaultsSchema,
  routes: z.array(routeSchema).min(1),
  resolution: resolutionSchema,
  canonical: canonicalSchema,
  facets: facetsSchema,
  excluded: excludedSchema,
  forbiddenInProduction: forbiddenInProductionSchema,
  sitemapXml: sitemapXmlSchema,
});

export type RoutesManifest = z.infer<typeof routesManifestSchema>;
export type ManifestRoute = z.infer<typeof routeSchema>;
