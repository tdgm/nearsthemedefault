import { describe, expect, it } from 'vitest';
import { fill } from './template';

describe('fill', () => {
  it('substitui placeholders conhecidos e preserva os desconhecidos', () => {
    expect(fill('Favoritar {name} ({n})', { name: 'Camiseta' })).toBe('Favoritar Camiseta ({n})');
  });
  it('aceita numeros', () => {
    expect(fill('{n} produtos', { n: 12 })).toBe('12 produtos');
  });
});
