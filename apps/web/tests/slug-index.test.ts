import { describe, expect, it } from 'vitest';
import { buildSlugIndex, SlugIndexError } from '../lib/routing/slug-index';

const empty = { department: [], 'category-flat': [], campaign: [], institutional: [] };

describe('buildSlugIndex', () => {
  it('indexa cada slug na sua fonte', () => {
    const index = buildSlugIndex({ ...empty, department: ['a'], campaign: ['b'], institutional: ['c'] }, []);
    expect(index.get('a')?.route).toBe('department');
    expect(index.get('b')?.route).toBe('campaign');
    expect(index.get('c')?.route).toBe('institutional');
    expect(index.get('zzz')).toBeUndefined();
  });

  it('falha o build quando o mesmo slug aparece em duas fontes', () => {
    expect(() => buildSlugIndex({ ...empty, department: ['verao'], campaign: ['verao'] }, [])).toThrow(SlugIndexError);
    expect(() => buildSlugIndex({ ...empty, department: ['verao'], campaign: ['verao'] }, [])).toThrow(/"verao" aparece em department e em campaign/);
  });

  it('falha com slug repetido na mesma fonte', () => {
    expect(() => buildSlugIndex({ ...empty, department: ['a', 'a'] }, [])).toThrow(/aparece em department e em department/);
  });

  it('falha com slug reservado e lista todos os problemas', () => {
    try {
      buildSlugIndex({ ...empty, department: ['s', 'checkout'], institutional: ['api'] }, ['s', 'checkout', 'api']);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(SlugIndexError);
      expect((e as SlugIndexError).problems).toHaveLength(3);
    }
  });

  it('reservado e por segmento exato: "saias" nao colide com "s"', () => {
    expect(buildSlugIndex({ ...empty, department: ['saias', 'sofas'] }, ['s']).size).toBe(2);
  });
});
