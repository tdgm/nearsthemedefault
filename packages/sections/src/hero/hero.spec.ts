import { defineSpec } from '../define.ts';
import { heroSchema } from './hero.schema.ts';

export const heroSpec = defineSpec({
  id: 'hero',
  schema: heroSchema,
  meta: {
    priority: 'critical',
    cwv: { lcpCandidate: true, firstSlide: { loading: 'eager', fetchpriority: 'high' }, media: 'picture', aspectRatio: 'required' },
    a11y: { carousel: 'apg-basic', pauseControl: 'required-with-autoplay', keyboardNav: true },
  },
  story: 'packages/sections/src/hero/hero.stories.tsx',
});
