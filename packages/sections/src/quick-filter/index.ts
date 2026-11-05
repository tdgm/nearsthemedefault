import { defineSection } from '../define.ts';
import { QuickFilter } from './quick-filter.tsx';
import { quickFilterSpec } from './quick-filter.spec.ts';

export { QuickFilter } from './quick-filter.tsx';
export { quickFilterSchema, type QuickFilterProps } from './quick-filter.schema.ts';
export { quickFilterSpec };

export const quickFilter = defineSection({ ...quickFilterSpec, Component: QuickFilter });
