import { defineSpec } from '../define.ts';
import { benefitBarSchema } from './benefit-bar.schema.ts';

export const benefitBarSpec = defineSpec({
  id: 'benefit-bar',
  schema: benefitBarSchema,
  meta: {
    priority: 'high',
    cwv: { reservedHeight: 44 },
    a11y: { role: 'list' },
  },
  story: 'packages/sections/src/benefit-bar/benefit-bar.stories.tsx',
});
