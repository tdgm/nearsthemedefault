import { defineSpec } from '../define.ts';
import { pdpReviewsSchema } from './pdp-reviews.schema.ts';

export const pdpReviewsSpec = defineSpec({
  id: 'pdp-reviews',
  schema: pdpReviewsSchema,
  meta: {
    priority: 'lazy',
    cwv: { ssrAggregate: true, contentVisibility: 'auto', containIntrinsicSize: 360 },
    a11y: { ratingTextAlternative: 'required', headingOrder: 'h2>h3' },
  },
  story: 'packages/sections/src/pdp-reviews/pdp-reviews.stories.tsx',
});
