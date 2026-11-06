import { defineSpec } from '../define.ts';
import { pdpPickupSchema } from './pdp-pickup.schema.ts';

export const pdpPickupSpec = defineSpec({
  id: 'pdp-pickup',
  schema: pdpPickupSchema,
  meta: {
    priority: 'high',
    cwv: { reservedHeight: 64, noLayoutShift: true },
    a11y: { liveRegion: 'status', noJsRequired: true },
  },
  story: 'packages/sections/src/pdp-pickup/pdp-pickup.stories.tsx',
});
