import { defineSection } from '../define.ts';
import { PromoBar } from './promo-bar.tsx';
import { promoBarSpec } from './promo-bar.spec.ts';

export { PromoBar } from './promo-bar.tsx';
export { promoBarSchema, type PromoBarProps } from './promo-bar.schema.ts';
export { promoBarSpec };

export const promoBar = defineSection({ ...promoBarSpec, Component: PromoBar });
