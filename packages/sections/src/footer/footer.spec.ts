// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { footerSchema } from './footer.schema.ts';

export const footerSpec = defineSpec({
  id: 'footer',
  schema: footerSchema,
  meta: {
    priority: 'lazy',
    cwv: { contentVisibility: 'auto', containIntrinsicSize: '0 640px' },
    a11y: { landmark: 'contentinfo', collapsibleAria: true },
  },
  story: 'packages/sections/src/footer/footer.stories.tsx',
});
