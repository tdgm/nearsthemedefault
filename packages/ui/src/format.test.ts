import { describe, expect, it } from 'vitest';
import { formatCep, formatCnpj, formatDateBR, formatInstallment, formatMoney } from './format';

describe('formatMoney', () => {
  it('formata com virgula decimal e separador de milhar BR', () => {
    expect(formatMoney(1234.5)).toBe('R$ 1.234,50');
  });
  it('formata valor sem centavos', () => {
    expect(formatMoney(99)).toBe('R$ 99,00');
  });
});

describe('formatInstallment', () => {
  it('monta "Nx de R$ Y sem juros"', () => {
    expect(formatInstallment(3, 33.33)).toBe('3x de R$ 33,33 sem juros');
  });
  it('indica juros quando interestFree e false', () => {
    expect(formatInstallment(10, 15)).not.toBe(formatInstallment(10, 15, false));
    expect(formatInstallment(10, 15, false)).toContain('com juros');
  });
});

describe('formatCep', () => {
  it('aceita so numeros e aplica a mascara', () => {
    expect(formatCep('01310100')).toBe('01310-100');
  });
  it('aceita ja mascarado', () => {
    expect(formatCep('01310-100')).toBe('01310-100');
  });
  it('rejeita tamanho errado', () => {
    expect(() => formatCep('123')).toThrow();
  });
});

describe('formatCnpj', () => {
  it('aplica a mascara', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });
  it('rejeita tamanho errado', () => {
    expect(() => formatCnpj('123')).toThrow();
  });
});

describe('formatDateBR', () => {
  it('formata Date como dd/mm/aaaa', () => {
    expect(formatDateBR(new Date(2026, 2, 5))).toBe('05/03/2026');
  });
  it('formata string ISO', () => {
    expect(formatDateBR('2026-12-25T12:00:00Z')).toBe('25/12/2026');
  });
  it('rejeita data invalida', () => {
    expect(() => formatDateBR('nao-e-data')).toThrow();
  });
});
