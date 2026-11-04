// Parte pura da section (sem JSX): carregavel em Node pelo gate do registry.
import { defineSpec } from '../define.ts';
import { customerServiceSchema } from './customer-service.schema.ts';

export const customerServiceSpec = defineSpec({
  id: 'customer-service',
  schema: customerServiceSchema,
  meta: {
    priority: 'idle',
    cwv: { reservedHeight: 0, noLayoutShift: true },
    a11y: { minTouchTarget: 44 },
  },
  story: 'packages/sections/src/customer-service/customer-service.stories.tsx',
});
