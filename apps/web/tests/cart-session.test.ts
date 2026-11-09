import { describe, expect, it } from 'vitest';
import {
  CART_COOKIE,
  cartCookieHeader,
  clearCartCookieHeader,
  decodeCartItems,
  mergeCartItem,
  readCartItems,
  setCartItemQuantity,
} from '../lib/cart/session';

describe('cartCookieHeader / decodeCartItems (round-trip)', () => {
  it('codifica e decodifica os mesmos itens', () => {
    const header = cartCookieHeader([{ sku: 'SKU-0001', quantity: 2 }]);
    expect(header).toContain(`${CART_COOKIE}=`);
    const value = header.split(';')[0]!.split('=')[1]!;
    expect(decodeCartItems(value)).toEqual([{ sku: 'SKU-0001', quantity: 2 }]);
  });

  it('atributos do cookie: HttpOnly, SameSite=Lax, Max-Age de 30 dias', () => {
    const header = cartCookieHeader([]);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain(`Max-Age=${60 * 60 * 24 * 30}`);
  });

  it('cap de 50 itens: linhas excedentes sao descartadas na escrita', () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ sku: `SKU-${i}`, quantity: 1 }));
    const header = cartCookieHeader(many);
    const value = header.split(';')[0]!.split('=')[1]!;
    expect(decodeCartItems(value)).toHaveLength(50);
  });
});

describe('clearCartCookieHeader', () => {
  it('Max-Age=0', () => {
    expect(clearCartCookieHeader()).toContain('Max-Age=0');
  });
});

describe('decodeCartItems: nunca lanca erro, carrinho quebrado volta vazio', () => {
  it('valor ausente', () => {
    expect(decodeCartItems(undefined)).toEqual([]);
    expect(decodeCartItems(null)).toEqual([]);
    expect(decodeCartItems('')).toEqual([]);
  });

  it('JSON invalido', () => {
    expect(decodeCartItems('nao-e-json')).toEqual([]);
  });

  it('JSON valido mas fora do schema (sku vazio, quantity fora do intervalo)', () => {
    expect(decodeCartItems(encodeURIComponent(JSON.stringify([{ sku: '', quantity: 1 }])))).toEqual([]);
    expect(decodeCartItems(encodeURIComponent(JSON.stringify([{ sku: 'SKU-1', quantity: 0 }])))).toEqual([]);
    expect(decodeCartItems(encodeURIComponent(JSON.stringify([{ sku: 'SKU-1', quantity: 100 }])))).toEqual([]);
  });

  it('mais de 50 linhas: o array inteiro e invalido (nunca trunca silenciosamente)', () => {
    const many = Array.from({ length: 51 }, (_, i) => ({ sku: `SKU-${i}`, quantity: 1 }));
    expect(decodeCartItems(encodeURIComponent(JSON.stringify(many)))).toEqual([]);
  });
});

describe('readCartItems (header Cookie cru, para API routes)', () => {
  it('sem cookie nenhum', () => {
    expect(readCartItems(null)).toEqual([]);
    expect(readCartItems('')).toEqual([]);
  });

  it('acha o cookie certo entre varios', () => {
    const value = encodeURIComponent(JSON.stringify([{ sku: 'SKU-0001', quantity: 3 }]));
    expect(readCartItems(`outro=x; ${CART_COOKIE}=${value}; terceiro=y`)).toEqual([{ sku: 'SKU-0001', quantity: 3 }]);
  });
});

describe('mergeCartItem', () => {
  it('cria uma linha nova quando o sku nao existe', () => {
    expect(mergeCartItem([], 'SKU-0001', 2)).toEqual([{ sku: 'SKU-0001', quantity: 2 }]);
  });

  it('soma a quantidade quando o sku ja existe', () => {
    expect(mergeCartItem([{ sku: 'SKU-0001', quantity: 2 }], 'SKU-0001', 3)).toEqual([{ sku: 'SKU-0001', quantity: 5 }]);
  });

  it('nunca passa de 99 (mesmo teto de /api/cart/items)', () => {
    expect(mergeCartItem([{ sku: 'SKU-0001', quantity: 95 }], 'SKU-0001', 10)).toEqual([{ sku: 'SKU-0001', quantity: 99 }]);
  });
});

describe('setCartItemQuantity', () => {
  it('define a quantidade absoluta de uma linha existente', () => {
    expect(setCartItemQuantity([{ sku: 'SKU-0001', quantity: 2 }], 'SKU-0001', 5)).toEqual([{ sku: 'SKU-0001', quantity: 5 }]);
  });

  it('quantity <= 0 remove a linha', () => {
    expect(setCartItemQuantity([{ sku: 'SKU-0001', quantity: 2 }], 'SKU-0001', 0)).toEqual([]);
  });

  it('sku que nao existe e quantity > 0: cria a linha', () => {
    expect(setCartItemQuantity([], 'SKU-0001', 4)).toEqual([{ sku: 'SKU-0001', quantity: 4 }]);
  });

  it('sku que nao existe e quantity <= 0: sem efeito', () => {
    expect(setCartItemQuantity([{ sku: 'SKU-0002', quantity: 1 }], 'SKU-0001', 0)).toEqual([{ sku: 'SKU-0002', quantity: 1 }]);
  });
});
