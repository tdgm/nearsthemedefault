import { describe, expect, it } from 'vitest';
import { matchesPattern, resolveHeaderVariant } from './variant.ts';

const rules = [{ pattern: '*/p', variant: 'minimal' as const }];

describe('matchesPattern', () => {
  it('* casa um unico segmento', () => {
    expect(matchesPattern('*/p', '/camiseta-basica/p')).toBe(true);
    expect(matchesPattern('*/p', '/p')).toBe(false);
    expect(matchesPattern('*/p', '/a/b/p')).toBe(false);
  });
  it('segmento literal casa igual', () => {
    expect(matchesPattern('/s', '/s')).toBe(true);
    expect(matchesPattern('/s', '/b')).toBe(false);
  });
  it('ignora barras repetidas e a barra final', () => {
    expect(matchesPattern('*/p', 'camiseta/p/')).toBe(true);
  });
});

describe('resolveHeaderVariant', () => {
  it('PDP usa minimal', () => expect(resolveHeaderVariant('/camiseta/p', rules)).toBe('minimal'));
  it('demais rotas usam full', () => {
    expect(resolveHeaderVariant('/', rules)).toBe('full');
    expect(resolveHeaderVariant('/feminino', rules)).toBe('full');
  });
  it('a primeira regra que casa vence', () => {
    expect(resolveHeaderVariant('/x/p', [{ pattern: '*/p', variant: 'none' }, ...rules])).toBe('none');
  });
});
