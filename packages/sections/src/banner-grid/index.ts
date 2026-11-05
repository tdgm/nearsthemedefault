import { defineSection } from '../define.ts';
import { BannerGrid } from './banner-grid.tsx';
import { bannerGridSpec } from './banner-grid.spec.ts';

export { BannerGrid } from './banner-grid.tsx';
export { bannerGridSchema, type BannerGridProps } from './banner-grid.schema.ts';
export { bannerGridSpec };

export const bannerGrid = defineSection({ ...bannerGridSpec, Component: BannerGrid });
