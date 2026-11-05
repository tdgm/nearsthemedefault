import { defineSection } from '../define.ts';
import { PdpBundle } from './pdp-bundle.tsx';
import { pdpBundleSpec } from './pdp-bundle.spec.ts';

export { PdpBundle } from './pdp-bundle.tsx';
export { pdpBundleSchema, type PdpBundleProps } from './pdp-bundle.schema.ts';
export { pdpBundleSpec };

export const pdpBundle = defineSection({ ...pdpBundleSpec, Component: PdpBundle });
