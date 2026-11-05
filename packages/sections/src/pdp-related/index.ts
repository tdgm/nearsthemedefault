import { defineSection } from '../define.ts';
import { PdpRelated } from './pdp-related.tsx';
import { pdpRelatedSpec } from './pdp-related.spec.ts';

export { PdpRelated } from './pdp-related.tsx';
export { pdpRelatedSchema, type PdpRelatedProps } from './pdp-related.schema.ts';
export { pdpRelatedSpec };

export const pdpRelated = defineSection({ ...pdpRelatedSpec, Component: PdpRelated });
