import { defineSpec } from '../define.ts';
import { productGridSchema } from './product-grid.schema.ts';

export const productGridSpec = defineSpec({
  id: 'product-grid',
  schema: productGridSchema,
  meta: {
    priority: 'critical',
    cwv: { ssr: true, skeleton: true, imageSizes: 'required', noLayoutShift: true, containIntrinsicSize: 'required' },
    a11y: { role: 'list', resultsLiveRegion: true, filtersInDrawer: 'focusTrap' },
  },
  story: 'packages/sections/src/product-grid/product-grid.stories.tsx',
});
