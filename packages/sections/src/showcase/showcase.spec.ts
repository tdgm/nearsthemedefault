import { defineSpec } from '../define.ts';
import { showcaseSchema } from './showcase.schema.ts';

export const showcaseSpec = defineSpec({
  id: 'showcase',
  schema: showcaseSchema,
  meta: {
    priority: 'lazy',
    cwv: { ssrFirstTab: true, scrollSnap: 'native', contentVisibility: 'auto', containIntrinsicSize: '0 520px' },
    a11y: { tabs: 'tablist', keyboardNav: true, region: true },
  },
  story: 'packages/sections/src/showcase/showcase.stories.tsx',
});
