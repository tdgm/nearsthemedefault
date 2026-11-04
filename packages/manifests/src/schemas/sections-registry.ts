import { z } from 'zod';

/**
 * Schema de nears/sections.registry.yaml.
 *
 * `props` fica deliberadamente como registro aberto (z.record): a mini-DSL de
 * props (type/of/values/from/enabledBy...) ainda nao tem consumidor em
 * runtime (isso chega quando packages/ui e packages/sections lerem o
 * registry para gerar prop-types - Fase 3+). O que a Fase 2 exige, e o que
 * este schema enforca de verdade, e que toda section declare `priority`,
 * `cwv` e `a11y` (nears/sections.registry.yaml > validation.everySectionMustDeclare) -
 * sao campos obrigatorios abaixo, nao opcionais.
 */

const propsSchema = z.record(z.string(), z.unknown());
const cwvSchema = z.record(z.string(), z.unknown());
const a11ySchema = z.record(z.string(), z.unknown());
const seoSchema = z.record(z.string(), z.unknown());
const geoSchema = z.record(z.string(), z.unknown());

const variantRuleSchema = z.object({
  pattern: z.string().min(1),
  variant: z.string().min(1),
});

/** Base comum a globals, sections e pdpSections. */
const sectionEntrySchema = z.object({
  id: z.string().min(1),
  slot: z.string().min(1).optional(),
  priority: z.string().min(1),
  variants: z.array(z.string().min(1)).optional(),
  variantRules: z.array(variantRuleSchema).optional(),
  nestedOnlyIn: z.array(z.string().min(1)).optional(),
  props: propsSchema.optional(),
  cwv: cwvSchema,
  a11y: a11ySchema,
  seo: seoSchema.optional(),
  geo: geoSchema.optional(),
  note: z.string().optional(),
});

const repeatBlockSchema = z.object({
  repeat: z.object({
    over: z.string().min(1),
    limit: z.union([z.number().int().positive(), z.object({ from: z.string().min(1) })]).optional(),
    blocks: z.array(z.string().min(1)).min(1),
  }),
});

/** Item de `templates.<id>.sections`: um id de section (aceita "id:variante", ex. "showcase:tabs") ou um bloco `repeat`. */
const templateSectionItemSchema = z.union([z.string().min(1), repeatBlockSchema]);

const templateSchema = z.object({
  sections: z.array(templateSectionItemSchema).min(1),
});

const validationSchema = z.object({
  everySectionMustDeclare: z.array(z.string().min(1)).min(1),
  onMissing: z.string().min(1),
  maxSectionsPerPage: z.number().int().positive(),
  maxSectionInstancesPerPage: z.number().int().positive(),
  maxCriticalSections: z.number().int().positive(),
});

export const sectionsRegistrySchema = z.object({
  version: z.string().min(1),
  priorityLevels: z.record(z.string(), z.string()),
  globals: z.array(sectionEntrySchema),
  sections: z.array(sectionEntrySchema),
  pdpSections: z.array(sectionEntrySchema),
  templates: z.record(z.string(), templateSchema),
  validation: validationSchema,
});

export type SectionsRegistry = z.infer<typeof sectionsRegistrySchema>;
export type SectionEntry = z.infer<typeof sectionEntrySchema>;
export type TemplateSectionItem = z.infer<typeof templateSectionItemSchema>;
