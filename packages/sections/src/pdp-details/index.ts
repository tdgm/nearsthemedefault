import { defineSection } from '../define.ts';
import { PdpDetails } from './pdp-details.tsx';
import { pdpDetailsSpec } from './pdp-details.spec.ts';

export { PdpDetails } from './pdp-details.tsx';
export { pdpDetailsSchema, type PdpDetailsProps } from './pdp-details.schema.ts';
export { pdpDetailsSpec };

export const pdpDetails = defineSection({ ...pdpDetailsSpec, Component: PdpDetails });
