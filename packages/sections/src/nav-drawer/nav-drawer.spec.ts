// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { navDrawerSchema } from './nav-drawer.schema.ts';

export const navDrawerSpec = defineSpec({
  id: 'nav-drawer',
  schema: navDrawerSchema,
  meta: { priority: 'on-interaction', cwv: { linksInInitialHtml: true, jsOnInteraction: true }, a11y: { focusTrap: true, escClose: true, ariaExpanded: true, landmark: 'navigation' } },
  story: 'packages/sections/src/nav-drawer/nav-drawer.stories.tsx',
});
