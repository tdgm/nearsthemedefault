import { defineSection } from '../define.ts';
import { Faq } from './faq.tsx';
import { faqSpec } from './faq.spec.ts';

export { Faq } from './faq.tsx';
export { faqSchema, type FaqProps } from './faq.schema.ts';
export { faqSpec };

export const faq = defineSection({ ...faqSpec, Component: Faq });
