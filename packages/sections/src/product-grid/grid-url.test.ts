import { describe, expect, it } from 'vitest';
import { pageHref, toQueryString } from './grid-url';

describe('toQueryString', () => {
  it('ordena parametros e valores, codifica e ignora vazios', () => {
    expect(toQueryString({ z: '1', a: ['y', 'x'], b: '', c: 'a b' })).toBe('?a=x&a=y&c=a%20b&z=1');
  });
  it('sem parametros devolve vazio', () => {
    expect(toQueryString({})).toBe('');
  });
});

describe('pageHref', () => {
  it('pagina 1 e a URL limpa', () => {
    expect(pageHref('/feminino', { page: '3', sort: 'newest' }, 1)).toBe('/feminino?sort=newest');
    expect(pageHref('/feminino', { page: '3' }, 1)).toBe('/feminino');
  });
  it('pagina N preserva filtros e ordenacao', () => {
    expect(pageHref('/feminino', { brand: ['b', 'a'], sort: 'price_asc' }, 3)).toBe('/feminino?brand=a&brand=b&page=3&sort=price_asc');
  });
  it('sem basePath devolve href relativo valido', () => {
    expect(pageHref('', {}, 1)).toBe('?');
  });
});
