import { defineSection } from '../define.ts';
import { RelatedLinks } from './related-links.tsx';
import { relatedLinksSpec } from './related-links.spec.ts';

export { RelatedLinks } from './related-links.tsx';
export { relatedLinksSchema, type RelatedLinksProps } from './related-links.schema.ts';
export { relatedLinksSpec };

export const relatedLinks = defineSection({ ...relatedLinksSpec, Component: RelatedLinks });
