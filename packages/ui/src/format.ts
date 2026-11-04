// Formatacao BR (CLAUDE.md > Codigo: "Formatacao BR centralizada em /lib/format").
// Vive aqui (nao em apps/web/lib) porque @nears/ui > Price precisa dela e um
// pacote compartilhado nao pode depender do app que o consome; apps/web/lib/format.ts
// reexporta estas funcoes para o codigo de app continuar importando de "/lib/format".

/** R$ 1.234,56 - sempre com virgula decimal e separador de milhar BR. */
export function formatMoney(valueInReais: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(valueInReais);
}

/** "3x de R$ 33,33 sem juros" / "3x de R$ 33,33 com juros" quando interestFree=false. */
export function formatInstallment(count: number, valuePerInstallment: number, interestFree = true): string {
  const suffix = interestFree ? 'sem juros' : 'com juros';
  return `${count}x de ${formatMoney(valuePerInstallment)} ${suffix}`;
}

/** 00000-000. Aceita so numeros (com ou sem mascara) e falha alto se nao tiver 8 digitos. */
export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 8) throw new Error(`CEP invalido: "${raw}" (esperado 8 digitos)`);
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** 00.000.000/0000-00. */
export function formatCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 14) throw new Error(`CNPJ invalido: "${raw}" (esperado 14 digitos)`);
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** dd/mm/aaaa a partir de Date ou string ISO (YYYY-MM-DD / timestamp completo). */
export function formatDateBR(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) throw new Error(`data invalida: "${String(value)}"`);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
