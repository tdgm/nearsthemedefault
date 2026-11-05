import { defineSection } from '../define.ts';
import { SectionTitle } from './section-title.tsx';
import { sectionTitleSpec } from './section-title.spec.ts';

export { SectionTitle } from './section-title.tsx';
export { sectionTitleSchema, type SectionTitleProps } from './section-title.schema.ts';
export { sectionTitleSpec };

export const sectionTitle = defineSection({ ...sectionTitleSpec, Component: SectionTitle });
