import { defineSection } from '../define.ts';
import { PdpGallery } from './pdp-gallery.tsx';
import { pdpGallerySpec } from './pdp-gallery.spec.ts';

export { PdpGallery } from './pdp-gallery.tsx';
export { pdpGallerySchema, type PdpGalleryProps } from './pdp-gallery.schema.ts';
export { pdpGallerySpec };

export const pdpGallery = defineSection({ ...pdpGallerySpec, Component: PdpGallery });
