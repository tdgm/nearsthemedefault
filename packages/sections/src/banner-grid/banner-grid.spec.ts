import { defineSpec } from '../define.ts';
import { bannerGridSchema } from './banner-grid.schema.ts';

export const bannerGridSpec = defineSpec({
  id: 'banner-grid',
  schema: bannerGridSchema,
  meta: {
    priority: 'lazy',
    cwv: { media: 'picture', loading: 'lazy', aspectRatio: 'required' },
    a11y: { role: 'list', altRequired: true },
  },
  story: 'packages/sections/src/banner-grid/banner-grid.stories.tsx',
});
