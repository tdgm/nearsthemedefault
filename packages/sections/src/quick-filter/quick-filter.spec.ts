import { defineSpec } from '../define.ts';
import { quickFilterSchema } from './quick-filter.schema.ts';

export const quickFilterSpec = defineSpec({
  id: 'quick-filter',
  schema: quickFilterSchema,
  meta: {
    priority: 'high',
    cwv: { reservedHeight: 48, scrollSnap: 'native' },
    a11y: { role: 'list', minTouchTarget: 44 },
  },
  story: 'packages/sections/src/quick-filter/quick-filter.stories.tsx',
});
