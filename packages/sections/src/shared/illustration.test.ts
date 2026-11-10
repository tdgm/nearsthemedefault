import { describe, expect, it } from 'vitest';
import { illustrationFilter } from './illustration';

describe('illustrationFilter', () => {
  it('e deterministico: a mesma semente sempre gera o mesmo filtro', () => {
    expect(illustrationFilter('/departamento-exemplo/categoria-exemplo')).toBe(
      illustrationFilter('/departamento-exemplo/categoria-exemplo'),
    );
  });

  it('varia entre sementes diferentes (nao retorna sempre a mesma receita)', () => {
    const seeds = ['/produto-exemplo/p', '/produto-2/p', '/produto-3/p', '/produto-4/p', '/produto-5/p', '/produto-6/p'];
    const filters = new Set(seeds.map(illustrationFilter));
    expect(filters.size).toBeGreaterThan(1);
  });

  it('nunca gera um filtro vazio (string "" vira undefined, nao atributo style em branco)', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const result = illustrationFilter(seed);
      expect(result === undefined || result.length > 0).toBe(true);
    }
  });
});
