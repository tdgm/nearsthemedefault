import { defineSpec } from '../define.ts';
import { productCardSchema } from './product-card.schema.ts';

export const productCardSpec = defineSpec({
  id: 'product-card',
  schema: productCardSchema,
  meta: {
    // Herda a priority do container (docs/adr/0006); o container passa `priority`.
    priority: 'inherit',
    cwv: { aspectRatio: 'media.aspect', intrinsicSize: 'required', lazy: 'belowFold', sizes: 'media.sizes.productCard' },
    a11y: { wholeCardLink: false, actionsSeparate: true, minTouchTarget: 44, altFromProductName: true },
  },
  story: 'packages/sections/src/product-card/product-card.stories.tsx',
});
