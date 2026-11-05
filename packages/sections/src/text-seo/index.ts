import { defineSection } from '../define.ts';
import { TextSeo } from './text-seo.tsx';
import { textSeoSpec } from './text-seo.spec.ts';

export { TextSeo } from './text-seo.tsx';
export { textSeoSchema, type TextSeoProps } from './text-seo.schema.ts';
export { textSeoSpec };

export const textSeo = defineSection({ ...textSeoSpec, Component: TextSeo });
