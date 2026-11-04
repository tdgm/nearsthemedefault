// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { formatBRL, formatInstallments } from '../lib/format';

describe('lib/format (reexport do design system)', () => {
  it('expoe a formatacao BR centralizada', () => {
    expect(formatBRL(10).replace(/ /g, ' ')).toBe('R$ 10,00');
    expect(formatInstallments(200, 2).replace(/ /g, ' ')).toBe('2x de R$ 100,00 sem juros');
  });
});
