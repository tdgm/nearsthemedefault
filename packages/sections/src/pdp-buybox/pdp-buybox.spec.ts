import { defineSpec } from '../define.ts';
import { pdpBuyboxSchema } from './pdp-buybox.schema.ts';

export const pdpBuyboxSpec = defineSpec({
  id: 'pdp-buybox',
  schema: pdpBuyboxSchema,
  meta: {
    priority: 'critical',
    cwv: { noLayoutShift: true, stickyReservedHeight: 72 },
    a11y: { variantSelector: 'radiogroup', liveRegion: 'addToCart', minTouchTarget: 44 },
  },
  story: 'packages/sections/src/pdp-buybox/pdp-buybox.stories.tsx',
});
