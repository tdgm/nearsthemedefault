import { defineSpec } from '../define.ts';
import { breadcrumbSchema } from './breadcrumb.schema.ts';

export const breadcrumbSpec = defineSpec({
  id: 'breadcrumb',
  schema: breadcrumbSchema,
  meta: {
    priority: 'critical',
    cwv: { reservedHeight: 32 },
    a11y: { landmark: 'navigation', label: 'Voce esta em' },
  },
  story: 'packages/sections/src/breadcrumb/breadcrumb.stories.tsx',
});
