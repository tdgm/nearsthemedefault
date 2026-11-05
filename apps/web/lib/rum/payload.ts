import { z } from 'zod';

// Contrato do beacon enviado por lib/rum/script.ts. Estrito: campo desconhecido e
// erro (nada de identificador entrando por acidente). `p` e so o pathname.
const metric = z.number().finite().min(0).max(600_000);

export const rumPayloadSchema = z.strictObject({
  p: z.string().startsWith('/').max(300).refine((p) => !p.includes('?'), 'sem query string'),
  v: z.enum(['m', 'd']),
  m: z
    .strictObject({ LCP: metric, FCP: metric, CLS: metric, INP: metric, TTFB: metric })
    .partial()
    .refine((m) => Object.keys(m).length > 0, 'ao menos uma metrica'),
});

export type RumPayload = z.output<typeof rumPayloadSchema>;

/** Limite de corpo aceito pelo endpoint (o beacon real tem ~150 bytes). */
export const RUM_MAX_BYTES = 1024;
