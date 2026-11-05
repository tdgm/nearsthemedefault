import { defineSection } from '../define.ts';
import { Minicart } from './minicart.tsx';
import { minicartSpec } from './minicart.spec.ts';

export { Minicart } from './minicart.tsx';
export { minicartSchema, cartItemSchema, type CartItem, type MinicartProps } from './minicart.schema.ts';
export { minicartSpec };

export const minicart = defineSection({ ...minicartSpec, Component: Minicart });
