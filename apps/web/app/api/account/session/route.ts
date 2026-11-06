// Sessao MOCK de login/logout (Fase 9, ADR 0027). Mesma disciplina de
// `/api/cart/items`: Zod valida so a FORMA do corpo; a senha nunca e
// verificada de verdade (este repo e frontend puro, sem backend de auth) -
// "credenciais invalidas" aqui significa so "e-mail fora dos clientes mock
// de apps/web/lib/data/customer.ts", nunca uma comparacao de senha real.
import { z } from 'zod';
import { clearSessionCookieHeader, sessionCookieHeader } from '../../../../lib/auth/session';
import { findCustomerByEmail } from '../../../../lib/data/customer';

const loginSchema = z.strictObject({
  email: z.email(),
  senha: z.string().min(1),
  // Caminho para onde voltar apos o login (ex.: /account vindo de um guard
  // `requiresAuth`, ADR 0027). So caminho relativo: nunca um redirect aberto.
  returnUrl: z.string().startsWith('/').default('/'),
});

function wantsJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}

/**
 * Volta para a pagina que fez o POST (so a /login chama este endpoint sem
 * JS) com `?erro=1`, preservando o resto da query (inclui `returnUrl`, se a
 * pagina ja tinha). Referer ausente ou de outro host: cai para `/login` -
 * nunca redireciona para fora da propria origem.
 */
function backWithError(request: Request): Response {
  const referer = request.headers.get('referer');
  const sameOrigin = referer && new URL(referer).origin === new URL(request.url).origin;
  const back = new URL(sameOrigin ? referer! : '/login', request.url);
  back.searchParams.set('erro', '1');
  return new Response(null, { status: 303, headers: { Location: back.toString() } });
}

/** `path` absoluto relativo a origem de `request`, nunca cruzando para outro host. */
function sameOriginRedirect(request: Request, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = loginSchema.safeParse(form ? Object.fromEntries(form) : {});
  if (!parsed.success) {
    if (wantsJson(request)) return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    return backWithError(request);
  }

  const { email, returnUrl } = parsed.data;
  const customer = await findCustomerByEmail(email);
  if (!customer) {
    if (wantsJson(request)) return Response.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
    return backWithError(request);
  }

  // Set-Cookie precisa ser anexado depois de criada a resposta: tanto
  // `Response.redirect()` quanto um redirect feito a mao com `Location` fixo
  // tem headers mutaveis o bastante para `.append`, mas `Response.redirect()`
  // especificamente devolve headers IMUTAVEIS no runtime deste projeto - por
  // isso o redirect de sucesso tambem usa `sameOriginRedirect` (Response
  // construida a mao), nunca `Response.redirect()`.
  const response = wantsJson(request) ? Response.json({ ok: true, customerId: customer.id }) : sameOriginRedirect(request, returnUrl);
  response.headers.append('Set-Cookie', sessionCookieHeader(customer.id));
  return response;
}

// Logout via fetch/JS. O botao "Sair" da area da conta (Fase 9c,
// app/account/page.tsx) usa um <form method="POST"> comum (HTML nao tem
// metodo DELETE), entao chama POST /api/account/session/logout em vez deste
// endpoint - ver app/api/account/session/logout/route.ts.
export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append('Set-Cookie', clearSessionCookieHeader());
  return response;
}
