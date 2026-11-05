import { defineSection } from '../define.ts';
import { Showcase } from './showcase.tsx';
import { showcaseSpec } from './showcase.spec.ts';

export { Showcase } from './showcase.tsx';
export { showcaseSchema, type ShowcaseProps } from './showcase.schema.ts';
export { showcaseSpec };

export const showcase = defineSection({ ...showcaseSpec, Component: Showcase });
