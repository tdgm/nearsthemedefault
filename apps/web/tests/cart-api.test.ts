import { describe, expect, it } from 'vitest';
import { POST as addItem } from '../app/api/cart/items/route';
import { POST as updateItem } from '../app/api/cart/items/update/route';
import { CART_COOKIE, decodeCartItems, type CartItem } from '../lib/cart/session';

/** Mesmo valor que `cartCookieHeader` produziria - construido direto, sem
 * depender de parsear o header que a propria funcao gera. */
function cookieWith(items: CartItem[]): string {
  return `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(items))}`;
}

function postForm(url: string, fields: Record<string, string | number>, { accept = 'application/json', cookie }: { accept?: string; cookie?: string } = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, String(value));
  const headers: Record<string, string> = { Accept: accept };
  if (cookie) headers.Cookie = cookie;
  return new Request(url, { method: 'POST', body, headers });
}

/** Extrai so o valor do cookie `nears_cart` de um header `Set-Cookie` de resposta. */
function cartCookieValue(setCookie: string | null): string | undefined {
  if (!setCookie) return undefined;
  const match = setCookie.match(new RegExp(`${CART_COOKIE}=([^;]*)`));
  return match?.[1];
}

describe('POST /api/cart/items (persiste de verdade - Fase 10, ADR 0029)', () => {
  it('sku novo: cria a linha e devolve Set-Cookie', async () => {
    const res = await addItem(postForm('http://localhost/api/cart/items', { sku: 'SKU-0001', quantity: 2 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, sku: 'SKU-0001', quantity: 2 });
    const value = cartCookieValue(res.headers.get('set-cookie'));
    expect(decodeCartItems(value)).toEqual([{ sku: 'SKU-0001', quantity: 2 }]);
  });

  it('sku ja no carrinho: soma a quantidade (nunca substitui)', async () => {
    const cookie = cookieWith([{ sku: 'SKU-0001', quantity: 2 }]);
    const res = await addItem(postForm('http://localhost/api/cart/items', { sku: 'SKU-0001', quantity: 3 }, { cookie }));
    const value = cartCookieValue(res.headers.get('set-cookie'));
    expect(decodeCartItems(value)).toEqual([{ sku: 'SKU-0001', quantity: 5 }]);
  });

  it('forma invalida (quantity fora do intervalo): 400, sem Set-Cookie', async () => {
    const res = await addItem(postForm('http://localhost/api/cart/items', { sku: 'SKU-0001', quantity: 999 }));
    expect(res.status).toBe(400);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('sem sku (produto sem SKU cadastrado): nunca escreve no carrinho, mas responde ok (limitacao pre-existente)', async () => {
    const res = await addItem(postForm('http://localhost/api/cart/items', { quantity: 1 }));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('sem JS (Accept html): 303 de volta pro referer, com Set-Cookie', async () => {
    const request = postForm('http://localhost/api/cart/items', { sku: 'SKU-0001', quantity: 1 }, { accept: 'text/html' });
    request.headers.set('referer', 'http://localhost/produto-exemplo/p');
    const res = await addItem(request);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/produto-exemplo/p');
    expect(cartCookieValue(res.headers.get('set-cookie'))).toBeDefined();
  });

  it('sem JS, referer de outro host: nunca redireciona para fora da propria origem', async () => {
    const request = postForm('http://localhost/api/cart/items', { sku: 'SKU-0001', quantity: 1 }, { accept: 'text/html' });
    request.headers.set('referer', 'https://evil.example/produto');
    const res = await addItem(request);
    expect(res.headers.get('location')).toBe('http://localhost/');
  });
});

describe('POST /api/cart/items/update (quantidade absoluta / remocao - Fase 10, ADR 0029)', () => {
  it('define a quantidade absoluta de uma linha existente', async () => {
    const cookie = cookieWith([{ sku: 'SKU-0001', quantity: 2 }]);
    const res = await updateItem(postForm('http://localhost/api/cart/items/update', { sku: 'SKU-0001', quantity: 7 }, { cookie }));
    expect(res.status).toBe(200);
    expect(decodeCartItems(cartCookieValue(res.headers.get('set-cookie')))).toEqual([{ sku: 'SKU-0001', quantity: 7 }]);
  });

  it('quantity=0 remove a linha', async () => {
    const cookie = cookieWith([{ sku: 'SKU-0001', quantity: 2 }, { sku: 'SKU-0002', quantity: 1 }]);
    const res = await updateItem(postForm('http://localhost/api/cart/items/update', { sku: 'SKU-0001', quantity: 0 }, { cookie }));
    expect(decodeCartItems(cartCookieValue(res.headers.get('set-cookie')))).toEqual([{ sku: 'SKU-0002', quantity: 1 }]);
  });

  it('forma invalida (sem sku): 400, sem Set-Cookie', async () => {
    const res = await updateItem(postForm('http://localhost/api/cart/items/update', { quantity: 1 }));
    expect(res.status).toBe(400);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('sem JS (Accept html): 303 de volta pro referer (ou /carrinho sem referer), com Set-Cookie', async () => {
    const cookie = cookieWith([{ sku: 'SKU-0001', quantity: 2 }]);
    const request = postForm('http://localhost/api/cart/items/update', { sku: 'SKU-0001', quantity: 0 }, { accept: 'text/html', cookie });
    const res = await updateItem(request);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/carrinho');
    expect(cartCookieValue(res.headers.get('set-cookie'))).toBeDefined();
  });
});
