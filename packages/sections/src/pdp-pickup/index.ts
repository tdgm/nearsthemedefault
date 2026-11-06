import { defineSection } from '../define.ts';
import { PdpPickup } from './pdp-pickup.tsx';
import { pdpPickupSpec } from './pdp-pickup.spec.ts';

export { PdpPickup } from './pdp-pickup.tsx';
export { pdpPickupSchema, type PdpPickupProps } from './pdp-pickup.schema.ts';
export { pdpPickupSpec };

export const pdpPickup = defineSection({ ...pdpPickupSpec, Component: PdpPickup });
