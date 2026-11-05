import { defineSection } from '../define.ts';
import { BannerFull } from './banner-full.tsx';
import { bannerFullSpec } from './banner-full.spec.ts';

export { BannerFull } from './banner-full.tsx';
export { bannerFullSchema, type BannerFullProps } from './banner-full.schema.ts';
export { bannerFullSpec };

export const bannerFull = defineSection({ ...bannerFullSpec, Component: BannerFull });
