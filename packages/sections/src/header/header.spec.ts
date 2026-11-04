// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { headerSchema } from './header.schema.ts';

export const headerSpec = defineSpec({
  id: 'header',
  schema: headerSchema,
  meta: { priority: 'critical', cwv: { reservedHeight: 56, sticky: true }, a11y: { landmark: 'banner', skipLink: 'required' } },
  story: 'packages/sections/src/header/header.stories.tsx',
});
