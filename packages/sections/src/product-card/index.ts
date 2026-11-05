import { defineSection } from '../define.ts';
import { ProductCard } from './product-card.tsx';
import { productCardSpec } from './product-card.spec.ts';

export { ProductCard } from './product-card.tsx';
export { productCardSchema, type ProductCardProps } from './product-card.schema.ts';
export { productCardSpec };

export const productCard = defineSection({ ...productCardSpec, Component: ProductCard });
