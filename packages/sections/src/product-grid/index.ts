import { defineSection } from '../define.ts';
import { ProductGrid } from './product-grid.tsx';
import { productGridSpec } from './product-grid.spec.ts';

export { ProductGrid } from './product-grid.tsx';
export { productGridSchema, type ProductGridProps } from './product-grid.schema.ts';
export { productGridSpec };

export const productGrid = defineSection({ ...productGridSpec, Component: ProductGrid });
