import { defineSpec } from '../define.ts';
import { pdpShippingSchema } from './pdp-shipping.schema.ts';

export const pdpShippingSpec = defineSpec({
  id: 'pdp-shipping',
  schema: pdpShippingSchema,
  meta: {
    priority: 'high',
    cwv: { reservedHeight: 96, noLayoutShift: true },
    a11y: { inputLabel: 'required', errorAssociation: 'aria-describedby', minTouchTarget: 44, noJsRequired: true },
  },
  story: 'packages/sections/src/pdp-shipping/pdp-shipping.stories.tsx',
});
