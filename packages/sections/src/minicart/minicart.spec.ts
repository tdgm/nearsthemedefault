// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { minicartSchema } from './minicart.schema.ts';

export const minicartSpec = defineSpec({
  id: 'minicart',
  schema: minicartSchema,
  meta: { priority: 'on-interaction', cwv: { noBlockingFetchOnLoad: true }, a11y: { focusTrap: true, escClose: true, liveRegion: true } },
  story: 'packages/sections/src/minicart/minicart.stories.tsx',
});
