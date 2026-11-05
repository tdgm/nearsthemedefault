import { defineSpec } from '../define.ts';
import { bannerFullSchema } from './banner-full.schema.ts';

export const bannerFullSpec = defineSpec({
  id: 'banner-full',
  schema: bannerFullSchema,
  meta: {
    priority: 'lazy',
    cwv: { media: 'picture', aspectRatio: 'required' },
    a11y: { contrastOverImage: 'verified', textOverImage: false },
  },
  story: 'packages/sections/src/banner-full/banner-full.stories.tsx',
});
