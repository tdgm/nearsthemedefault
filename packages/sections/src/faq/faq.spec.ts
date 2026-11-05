import { defineSpec } from '../define.ts';
import { faqSchema } from './faq.schema.ts';

export const faqSpec = defineSpec({
  id: 'faq',
  schema: faqSchema,
  meta: {
    priority: 'lazy',
    cwv: { contentVisibility: 'auto' },
    a11y: { accordion: true, keyboardNav: true, contentInDom: true },
  },
  story: 'packages/sections/src/faq/faq.stories.tsx',
});
