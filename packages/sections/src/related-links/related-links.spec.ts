import { defineSpec } from '../define.ts';
import { relatedLinksSchema } from './related-links.schema.ts';

export const relatedLinksSpec = defineSpec({
  id: 'related-links',
  schema: relatedLinksSchema,
  meta: {
    priority: 'lazy',
    cwv: { contentVisibility: 'auto' },
    a11y: { role: 'list' },
  },
  story: 'packages/sections/src/related-links/related-links.stories.tsx',
});
