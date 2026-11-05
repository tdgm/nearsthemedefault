import { z } from 'zod';

/** Espelha `globals.customer-service.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const customerServiceSchema = z.strictObject({
  channels: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        href: z.string().min(1),
        /** Texto de apoio, ex.: horario de atendimento. */
        description: z.string().optional(),
      }),
    )
    .min(1),
  labels: z.strictObject({ open: z.string(), title: z.string() }).partial().optional(),
});

export type CustomerServiceProps = z.infer<typeof customerServiceSchema>;
