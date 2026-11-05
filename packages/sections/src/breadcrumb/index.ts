import { defineSection } from '../define.ts';
import { BreadcrumbSection } from './breadcrumb.tsx';
import { breadcrumbSpec } from './breadcrumb.spec.ts';

export { BreadcrumbSection } from './breadcrumb.tsx';
export { breadcrumbSchema, type BreadcrumbSectionProps } from './breadcrumb.schema.ts';
export { breadcrumbSpec };

export const breadcrumbSection = defineSection({ ...breadcrumbSpec, Component: BreadcrumbSection });
