import { defineSection } from '../define.ts';
import { PdpShipping } from './pdp-shipping.tsx';
import { pdpShippingSpec } from './pdp-shipping.spec.ts';

export { PdpShipping } from './pdp-shipping.tsx';
export { pdpShippingSchema, type PdpShippingProps } from './pdp-shipping.schema.ts';
export { pdpShippingSpec };

export const pdpShipping = defineSection({ ...pdpShippingSpec, Component: PdpShipping });
