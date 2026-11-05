import { defineSection } from '../define.ts';
import { EventBanner } from './event-banner.tsx';
import { eventBannerSpec } from './event-banner.spec.ts';

export { EventBanner } from './event-banner.tsx';
export { eventBannerSchema, type EventBannerProps } from './event-banner.schema.ts';
export { eventBannerSpec };

export const eventBanner = defineSection({ ...eventBannerSpec, Component: EventBanner });
