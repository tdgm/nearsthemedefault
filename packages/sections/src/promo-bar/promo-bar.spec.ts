// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { promoBarSchema } from './promo-bar.schema.ts';

export const promoBarSpec = defineSpec({
  id: 'promo-bar',
  schema: promoBarSchema,
  meta: { priority: 'critical', cwv: { reservedHeight: 48, cls: 0, ssrTime: true }, a11y: { role: 'region', labelRequired: true, dismissKeyboard: true } },
  story: 'packages/sections/src/promo-bar/promo-bar.stories.tsx',
});
