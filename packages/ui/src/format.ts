// Formatacao BR centralizada (CLAUDE.md > Codigo). O app reexporta em
// apps/web/lib/format.ts. Sem dependencia: so Intl.
const LOCALE = 'pt-BR';
const CURRENCY = 'BRL';
const TIME_ZONE = 'America/Sao_Paulo';

const brl = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const date = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

/** 1234.5 -> "R$ 1.234,50" (espaco nao separavel, como o Intl entrega). */
export const formatBRL = (value: number): string => brl.format(value);

/** Valor da parcela, arredondado para baixo no centavo para nunca exceder o total. */
export const installmentValue = (total: number, count: number): number => Math.floor((total / count) * 100) / 100;

/** (300, 3) -> "3x de R$ 100,00 sem juros". */
export const formatInstallments = (total: number, count: number): string =>
  `${count}x de ${formatBRL(installmentValue(total, count))} sem juros`;

/** Desconto inteiro em % (de 100 por 80 = 20). 0 quando nao ha desconto real. */
export const percentOff = (list: number, price: number): number =>
  list > price && list > 0 ? Math.round(((list - price) / list) * 100) : 0;

const digits = (v: string) => v.replace(/\D/g, '');

/** "01310100" -> "01310-100". Entrada incompleta volta so com os digitos. */
export const formatCEP = (v: string): string => {
  const d = digits(v);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/** "11222333000181" -> "11.222.333/0001-81". */
export const formatCNPJ = (v: string): string => {
  const d = digits(v);
  return d.length === 14 ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}` : d;
};

/** Date ou ISO -> "dd/mm/aaaa" no fuso de Sao Paulo. */
export const formatDate = (v: Date | string): string => date.format(typeof v === 'string' ? new Date(v) : v);
