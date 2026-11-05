import { defineSpec } from '../define.ts';
import { pdpBundleSchema } from './pdp-bundle.schema.ts';

export const pdpBundleSpec = defineSpec({
  id: 'pdp-bundle',
  schema: pdpBundleSchema,
  meta: {
    priority: 'lazy',
    cwv: { scrollSnap: 'native', contentVisibility: 'auto', containIntrinsicSize: 520 },
    a11y: { role: 'list', keyboardNav: true },
  },
  story: 'packages/sections/src/pdp-bundle/pdp-bundle.stories.tsx',
});
