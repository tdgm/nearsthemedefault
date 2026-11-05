// Cotacao de frete por CEP. Hoje mock deterministico (a cotacao real e do backend,
// consumida via GraphQL como o resto do data layer); o contrato aqui e o que a
// section pdp-shipping recebe em `quote`.
import { z } from 'zod';

export const shippingOptionSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  days: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
});

export const shippingQuoteSchema = z.union([
  z.strictObject({ options: z.array(shippingOptionSchema).min(1) }),
  z.strictObject({ error: z.string().min(1) }),
]);

export type ShippingQuote = z.infer<typeof shippingQuoteSchema>;

/** Aceita "01310-100" ou "01310100"; devolve 8 digitos ou null. */
export function normalizeCep(raw: string | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  return /^\d{8}$/.test(digits) ? digits : null;
}

export const FREE_SHIPPING_FROM = 299;

export async function quoteShipping(rawCep: string | undefined, subtotal: number): Promise<ShippingQuote | undefined> {
  if (rawCep === undefined || rawCep.trim() === '') return undefined;
  const cep = normalizeCep(rawCep);
  if (!cep) return shippingQuoteSchema.parse({ error: 'Informe um CEP válido com 8 dígitos.' });
  // Mock: a regiao (1o digito) muda o prazo; frete gratis acima de FREE_SHIPPING_FROM.
  const region = Number(cep[0]);
  const base = 3 + Math.floor(region / 3);
  return shippingQuoteSchema.parse({
    options: [
      { id: 'padrao', name: 'Entrega padrão', price: subtotal >= FREE_SHIPPING_FROM ? 0 : 19.9, days: [base, base + 2] },
      { id: 'expressa', name: 'Entrega expressa', price: 34.9, days: [1, Math.max(2, base - 2)] },
    ],
  });
}
