// Schema de nears/contracts.yaml. Tipado so no que scripts e helpers leem hoje
// (gate de contraste, agentes de IA, schemas por template); o resto e laxo
// de proposito ate a Fase 7 gerar os helpers de JSON-LD.
import { z } from 'zod';

const strings = z.array(z.string());

export const contrastPairSchema = z.strictObject({
  fg: z.string().min(1),
  bg: z.array(z.string().min(1)).min(1),
  min: z.enum(['text', 'ui']),
});

export const contractsSchema = z.looseObject({
  version: z.string(),
  data: z.looseObject({
    product: z.looseObject({
      required: strings.min(1),
      requiredForGeo: strings.min(1),
      requiredForGeoFrom: z.string(),
      onMissingGeoField: z.enum(['warn-build', 'fail-build']),
    }),
    collection: z.looseObject({ required: strings.min(1) }),
    organization: z.looseObject({ required: strings.min(1) }),
  }),
  seo: z.looseObject({
    global: z.looseObject({ canonical: z.string() }),
    byTemplate: z.record(z.string(), z.looseObject({ schema: strings })),
  }),
  geo: z.looseObject({
    agents: z.record(z.string(), z.enum(['allow', 'disallow', 'decide'])),
  }),
  gates: z.looseObject({
    accessibility: z.looseObject({
      contrastPairs: z.array(contrastPairSchema).min(1),
      contrastMin: z.strictObject({ text: z.number().min(4.5), ui: z.number().min(3) }),
    }),
    governance: z.looseObject({ everySectionDeclares: strings }),
  }),
});

export type ContrastPair = z.output<typeof contrastPairSchema>;
export type Contracts = z.output<typeof contractsSchema>;
