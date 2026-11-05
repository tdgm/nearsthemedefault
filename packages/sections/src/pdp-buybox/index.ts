import { defineSection } from '../define.ts';
import { PdpBuybox } from './pdp-buybox.tsx';
import { pdpBuyboxSpec } from './pdp-buybox.spec.ts';

export { PdpBuybox } from './pdp-buybox.tsx';
export { pdpBuyboxSchema, type PdpBuyboxProps } from './pdp-buybox.schema.ts';
export { pdpBuyboxSpec };

export const pdpBuybox = defineSection({ ...pdpBuyboxSpec, Component: PdpBuybox });
