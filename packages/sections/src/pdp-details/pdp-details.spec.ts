import { defineSpec } from '../define.ts';
import { pdpDetailsSchema } from './pdp-details.schema.ts';

export const pdpDetailsSpec = defineSpec({
  id: 'pdp-details',
  schema: pdpDetailsSchema,
  meta: {
    priority: 'lazy',
    cwv: { contentVisibility: 'auto', containIntrinsicSize: 480 },
    a11y: { accordion: true, tableHeaders: 'scope', contentInDom: true },
  },
  story: 'packages/sections/src/pdp-details/pdp-details.stories.tsx',
});
