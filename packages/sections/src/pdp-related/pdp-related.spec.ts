import { defineSpec } from '../define.ts';
import { pdpRelatedSchema } from './pdp-related.schema.ts';

export const pdpRelatedSpec = defineSpec({
  id: 'pdp-related',
  schema: pdpRelatedSchema,
  meta: {
    priority: 'lazy',
    cwv: { scrollSnap: 'native', contentVisibility: 'auto', containIntrinsicSize: 520 },
    a11y: { role: 'list', keyboardNav: true },
  },
  story: 'packages/sections/src/pdp-related/pdp-related.stories.tsx',
});
