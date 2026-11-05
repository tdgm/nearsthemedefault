import { defineSection } from '../define.ts';
import { CategoryHub } from './category-hub.tsx';
import { categoryHubSpec } from './category-hub.spec.ts';

export { CategoryHub } from './category-hub.tsx';
export { categoryHubSchema, type CategoryHubProps } from './category-hub.schema.ts';
export { categoryHubSpec };

export const categoryHub = defineSection({ ...categoryHubSpec, Component: CategoryHub });
