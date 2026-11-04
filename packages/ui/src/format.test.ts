// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { formatBRL, formatCEP, formatCNPJ, formatDate, formatInstallments, installmentValue, percentOff } from './format';

const nbsp = (s: string) => s.replace(/\u00a0/g, ' ');

describe('format BR', () => {
  it('R$ com virgula e milhar com ponto', () => {
    expect(nbsp(formatBRL(1234.5))).toBe('R$ 1.234,50');
    expect(nbsp(formatBRL(0))).toBe('R$ 0,00');
  });

  it('parcelamento sem juros arredonda a parcela para baixo', () => {
    expect(nbsp(formatInstallments(300, 3))).toBe('3x de R$ 100,00 sem juros');
    expect(installmentValue(100, 3)).toBe(33.33);
    expect(nbsp(formatInstallments(100, 3))).toBe('3x de R$ 33,33 sem juros');
  });

  it('percentual de desconto so quando ha desconto real', () => {
    expect(percentOff(100, 80)).toBe(20);
    expect(percentOff(100, 100)).toBe(0);
    expect(percentOff(80, 100)).toBe(0);
    expect(percentOff(0, 0)).toBe(0);
  });

  it('CEP e CNPJ', () => {
    expect(formatCEP('01310100')).toBe('01310-100');
    expect(formatCEP('0131')).toBe('0131');
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    expect(formatCNPJ('11.222')).toBe('11222');
  });

  it('data dd/mm/aaaa no fuso de Sao Paulo', () => {
    expect(formatDate('2026-11-04T12:00:00Z')).toBe('04/11/2026');
    expect(formatDate(new Date('2026-01-05T02:00:00Z'))).toBe('04/01/2026'); // 23h do dia 4 em SP
  });
});
