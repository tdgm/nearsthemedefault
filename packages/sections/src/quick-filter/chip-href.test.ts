import { describe, expect, it } from 'vitest';
import { chipHref } from './chip-href';

describe('chipHref', () => {
  it('adiciona o filtro e codifica o valor', () => {
    expect(chipHref('/feminino', {}, { facet: 'cor', value: 'azul claro' })).toEqual({
      href: '/feminino?cor=azul%20claro',
      active: false,
      nofollow: false,
    });
  });

  it('ordena os parametros alfabeticamente e marca nofollow ao combinar facetas', () => {
    expect(chipHref('/feminino', { tamanho: 'M' }, { facet: 'cor', value: 'azul' })).toEqual({
      href: '/feminino?cor=azul&tamanho=M',
      active: false,
      nofollow: true,
    });
  });

  it('chip ativo remove o filtro (toggle)', () => {
    expect(chipHref('/feminino', { cor: 'azul' }, { facet: 'cor', value: 'azul' })).toEqual({
      href: '/feminino',
      active: true,
      nofollow: false,
    });
  });

  it('trocar o valor da mesma faceta nao combina facetas', () => {
    expect(chipHref('/f', { cor: 'azul' }, { facet: 'cor', value: 'preto' })).toMatchObject({ href: '/f?cor=preto', nofollow: false });
  });

  it('sem basePath e sem filtros devolve um href relativo valido', () => {
    expect(chipHref('', { cor: 'azul' }, { facet: 'cor', value: 'azul' }).href).toBe('?');
  });
});
