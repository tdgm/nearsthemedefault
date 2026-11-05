import { defineSpec } from '../define.ts';
import { textSeoSchema } from './text-seo.schema.ts';

export const textSeoSpec = defineSpec({
  id: 'text-seo',
  schema: textSeoSchema,
  meta: {
    priority: 'lazy',
    cwv: { contentVisibility: 'auto', containIntrinsicSize: '0 320px' },
    a11y: { expandControl: 'native-details', contentAlwaysInDom: true },
  },
  story: 'packages/sections/src/text-seo/text-seo.stories.tsx',
});
