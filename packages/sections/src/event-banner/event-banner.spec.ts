import { defineSpec } from '../define.ts';
import { eventBannerSchema } from './event-banner.schema.ts';

export const eventBannerSpec = defineSpec({
  id: 'event-banner',
  schema: eventBannerSchema,
  meta: {
    priority: 'lazy',
    cwv: { media: 'picture', aspectRatio: 'required' },
    a11y: { altRequired: true },
  },
  story: 'packages/sections/src/event-banner/event-banner.stories.tsx',
});
