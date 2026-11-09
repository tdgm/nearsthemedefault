// Atualizar/remover uma linha do carrinho (Fase 10, ADR 0029). `quantity: 0`
// remove a linha - HTML nao tem metodo DELETE em `<form>`, entao o botao
// "Remover" da pagina /carrinho usa este mesmo POST com quantity=0 (mesmo
// motivo de /api/account/session/logout usar POST em vez de DELETE).
// Mesmo padrao dual JSON/form+303 dos outros endpoints de carrinho/sessao.
import { z } from 'zod';
import { cartCookieHeader, readCartItems, setCartItemQuantity } from '../../../../../lib/cart/session';

const bodySchema = z.strictObject({
  sku: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

function sameOriginRedirect(request: Request, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = bodySchema.safeParse(form ? Object.fromEntries(form) : {});
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (!parsed.success) return wantsJson ? Response.json({ ok: false, error: 'invalid_body' }, { status: 400 }) : sameOriginRedirect(request, '/carrinho');

  const { sku, quantity } = parsed.data;
  const current = readCartItems(request.headers.get('cookie'));
  const next = setCartItemQuantity(current, sku, quantity);
  const setCookie = cartCookieHeader(next);

  if (wantsJson) {
    const response = Response.json({ ok: true, sku, quantity });
    response.headers.append('Set-Cookie', setCookie);
    return response;
  }
  const back = request.headers.get('referer');
  const response = sameOriginRedirect(request, back && new URL(back).origin === new URL(request.url).origin ? back : '/carrinho');
  response.headers.append('Set-Cookie', setCookie);
  return response;
}
