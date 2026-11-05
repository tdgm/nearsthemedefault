import { defineSpec } from '../define.ts';
import { sectionTitleSchema } from './section-title.schema.ts';

export const sectionTitleSpec = defineSpec({
  id: 'section-title',
  schema: sectionTitleSchema,
  meta: {
    priority: 'high',
    cwv: { noLayoutShift: true },
    a11y: { headingOrder: 'enforced' },
  },
  story: 'packages/sections/src/section-title/section-title.stories.tsx',
});
