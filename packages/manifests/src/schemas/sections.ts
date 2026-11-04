// Schema de nears/sections.registry.yaml: catalogo de blocos, DSL de props e
// composicao dos templates. A conversao do DSL para Zod esta em ../props.ts.
import { z } from 'zod';

export const PRIORITIES = ['critical', 'high', 'lazy', 'on-interaction', 'idle', 'inherit'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PROP_TYPES = [
  'string',
  'number',
  'boolean',
  'url',
  'image',
  'money',
  'datetime',
  'richtext',
  'table',
  'array',
  'object',
  'enum',
  'ref',
] as const;
export type PropType = (typeof PROP_TYPES)[number];

/**
 * DSL de props. Quatro formas:
 *  - "string"                      atalho: tipo opcional sem opcoes
 *  - { type: ..., required, ... }  forma completa
 *  - { campo: <PropDef>, ... }     objeto aninhado sem a chave `type`
 *  - 2 | true                      constante: vira o valor padrao do campo
 */
export type PropDef =
  | PropType
  | number
  | boolean
  | {
      type: PropType;
      required?: boolean | undefined;
      default?: unknown;
      min?: number | undefined;
      max?: number | undefined;
      of?: PropDef | undefined;
      values?: (string | number)[] | undefined;
      props?: Record<string, PropDef> | undefined;
      from?: string | undefined;
      enabledBy?: string | undefined;
      to?: string | undefined;
      note?: string | undefined;
    }
  | { [field: string]: PropDef };

const propType = z.enum(PROP_TYPES);

export const propDefSchema: z.ZodType<PropDef> = z.lazy(() =>
  z.union([
    propType,
    z.number(),
    z.boolean(),
    z.strictObject({
      type: propType,
      required: z.boolean().optional(),
      default: z.unknown().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      of: propDefSchema.optional(),
      values: z.array(z.union([z.string(), z.number()])).optional(),
      props: z.record(z.string(), propDefSchema).optional(),
      from: z.string().optional(),
      enabledBy: z.string().optional(),
      to: z.string().optional(),
      note: z.string().optional(),
    }),
    z.record(z.string(), propDefSchema),
  ]),
);

const declared = (what: string) =>
  z
    .record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, `${what} nao pode ser vazio: declare ao menos uma regra`);

export const sectionSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'use kebab-case'),
  slot: z.string().optional(),
  // priority, cwv e a11y sao obrigatorios (validation.everySectionMustDeclare):
  // faltar qualquer um falha o build.
  priority: z.enum(PRIORITIES),
  nestedOnlyIn: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional(),
  variantRules: z.array(z.strictObject({ pattern: z.string(), variant: z.string() })).optional(),
  props: z.record(z.string(), propDefSchema).default({}),
  cwv: declared('cwv'),
  a11y: declared('a11y'),
  seo: z.record(z.string(), z.unknown()).optional(),
  geo: z.record(z.string(), z.unknown()).optional(),
  note: z.string().optional(),
});

const repeatSchema = z.strictObject({
  repeat: z.strictObject({
    over: z.string().min(1),
    limit: z.union([z.number().int().positive(), z.strictObject({ from: z.string() })]).optional(),
    blocks: z.array(z.string()).min(1),
  }),
});

/** `id` ou `id:variante` (ex.: showcase:tabs), ou um bloco `repeat`. */
export const templateEntrySchema = z.union([z.string().min(1), repeatSchema]);

export const sectionsRegistrySchema = z.strictObject({
  version: z.string(),
  priorityLevels: z.record(z.string(), z.string()),
  globals: z.array(sectionSchema).min(1),
  sections: z.array(sectionSchema).min(1),
  pdpSections: z.array(sectionSchema).min(1),
  templates: z.record(z.string(), z.strictObject({ sections: z.array(templateEntrySchema).min(1) })),
  validation: z.strictObject({
    everySectionMustDeclare: z.tuple([z.literal('priority'), z.literal('cwv'), z.literal('a11y')]),
    onMissing: z.literal('fail-build'),
    maxSectionsPerPage: z.number().int().positive(),
    maxSectionInstancesPerPage: z.number().int().positive(),
    maxCriticalSections: z.number().int().positive(),
  }),
});

export type Section = z.output<typeof sectionSchema>;
export type TemplateEntry = z.output<typeof templateEntrySchema>;
export type SectionsRegistry = z.output<typeof sectionsRegistrySchema>;
