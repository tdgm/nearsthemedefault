import { defineSpec } from '../define.ts';
import { pdpGallerySchema } from './pdp-gallery.schema.ts';

export const pdpGallerySpec = defineSpec({
  id: 'pdp-gallery',
  schema: pdpGallerySchema,
  meta: {
    priority: 'critical',
    cwv: { lcpCandidate: true, firstImage: { fetchpriority: 'high' }, aspectRatio: 'media.aspect', noLayoutShift: true },
    a11y: { keyboardNav: true, zoomEscClose: true, minTouchTarget: 44, noJsNavigation: true },
  },
  story: 'packages/sections/src/pdp-gallery/pdp-gallery.stories.tsx',
});
