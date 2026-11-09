// Endpoint do "adicionar ao carrinho" (Fase 6, passou a persistir de verdade
// na Fase 10 - ADR 0029). Valida o corpo com Zod, mescla {sku, quantity} no
// cookie `nears_cart` atual (soma se a linha ja existe) e responde JSON pra
// fetch ou 303 de volta pra pagina quando o envio e um formulario sem JS.
// Nunca guarda preco/nome/estado de compra (CLAUDE.md > Seguranca) - so
// {sku, quantity}; o resto e resolvido contra o catalogo na leitura
// (apps/web/lib/data/cart.ts).
import { z } from 'zod';
import { cartCookieHeader, mergeCartItem, readCartItems } from '../../../../lib/cart/session';

const bodySchema = z.object({
  sku: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

/** `Response.redirect()` devolve headers IMUTAVEIS nesse runtime - mesmo
 * motivo documentado em `/api/account/session/route.ts`: pra anexar
 * `Set-Cookie` o redirect precisa ser uma `Response` construida a mao. */
function sameOriginRedirect(request: Request, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = bodySchema.safeParse(form ? Object.fromEntries(form) : {});
  if (!parsed.success) return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });

  const { sku, quantity } = parsed.data;
  if (sku) {
    const current = readCartItems(request.headers.get('cookie'));
    const next = mergeCartItem(current, sku, quantity);
    const setCookie = cartCookieHeader(next);

    if ((request.headers.get('accept') ?? '').includes('application/json')) {
      const response = Response.json({ ok: true, sku, quantity });
      response.headers.append('Set-Cookie', setCookie);
      return response;
    }
    const back = request.headers.get('referer');
    const response = sameOriginRedirect(request, back && new URL(back).origin === new URL(request.url).origin ? back : '/');
    response.headers.append('Set-Cookie', setCookie);
    return response;
  }

  // Produto sem SKU cadastrado (limitacao pre-existente: AddToCartForm so
  // envia `sku` quando o produto tem um) - nunca escreve no carrinho, mas
  // responde como antes (nunca quebra o fluxo sem JS).
  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return Response.json({ ok: true, quantity });
  }
  const back = request.headers.get('referer');
  return Response.redirect(back && new URL(back).origin === new URL(request.url).origin ? back : new URL('/', request.url), 303);
}
