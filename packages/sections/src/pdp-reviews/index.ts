import { defineSection } from '../define.ts';
import { PdpReviews } from './pdp-reviews.tsx';
import { pdpReviewsSpec } from './pdp-reviews.spec.ts';

export { PdpReviews } from './pdp-reviews.tsx';
export { pdpReviewsSchema, type PdpReviewsProps } from './pdp-reviews.schema.ts';
export { pdpReviewsSpec };

export const pdpReviews = defineSection({ ...pdpReviewsSpec, Component: PdpReviews });
