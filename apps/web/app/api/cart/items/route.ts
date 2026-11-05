// Endpoint MOCK do "adicionar ao carrinho" (o carrinho real e do backend/painel;
// este repo e frontend puro e nunca guarda estado de compra). Valida o corpo com
// Zod e responde JSON para fetch ou 303 de volta para a pagina quando o envio e
// um formulario sem JS.
import { z } from 'zod';

const bodySchema = z.object({
  sku: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = bodySchema.safeParse(form ? Object.fromEntries(form) : {});
  if (!parsed.success) return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });

  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return Response.json({ ok: true, ...parsed.data });
  }
  const back = request.headers.get('referer');
  return Response.redirect(back && new URL(back).origin === new URL(request.url).origin ? back : new URL('/', request.url), 303);
}
