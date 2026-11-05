import { defineSpec } from '../define.ts';
import { categoryHubSchema } from './category-hub.schema.ts';

export const categoryHubSpec = defineSpec({
  id: 'category-hub',
  schema: categoryHubSchema,
  meta: {
    priority: 'lazy',
    cwv: { aspectRatio: 'required', scrollSnap: 'native' },
    a11y: { role: 'list', keyboardScroll: true },
  },
  story: 'packages/sections/src/category-hub/category-hub.stories.tsx',
});
