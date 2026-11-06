// Cadastro MOCK (Fase 9, ADR 0027). So valida a FORMA do corpo - nome,
// e-mail e confirmacao de senha batendo - e nunca persiste: este repo e
// frontend puro, sem banco de clientes. "Sucesso" aqui so inicia a sessao
// mock com um id sintetico derivado do e-mail; nenhum cliente novo entra em
// `apps/web/lib/data/customer.ts` (fixture continua fixa).
import { z } from 'zod';
import { sessionCookieHeader } from '../../../../lib/auth/session';

const registerSchema = z
  .strictObject({
    nome: z.string().min(1),
    email: z.email(),
    senha: z.string().min(8),
    confirmarSenha: z.string().min(1),
    returnUrl: z.string().startsWith('/').default('/'),
  })
  .refine((v) => v.senha === v.confirmarSenha, { message: 'senha e confirmarSenha precisam ser iguais', path: ['confirmarSenha'] });

function wantsJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}

/**
 * Volta para a pagina que fez o POST (so a /cadastro chama este endpoint sem
 * JS) com `?erro=1`, preservando o resto da query. Referer ausente ou de
 * outro host: cai para `/cadastro` - nunca redireciona para fora da propria origem.
 */
function backWithError(request: Request): Response {
  const referer = request.headers.get('referer');
  const sameOrigin = referer && new URL(referer).origin === new URL(request.url).origin;
  const back = new URL(sameOrigin ? referer! : '/cadastro', request.url);
  back.searchParams.set('erro', '1');
  return new Response(null, { status: 303, headers: { Location: back.toString() } });
}

/** `path` absoluto relativo a origem de `request`, nunca cruzando para outro host. */
function sameOriginRedirect(request: Request, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

/** Id mock estavel para o e-mail informado - nunca um cliente real, so o suficiente para a sessao. */
function syntheticCustomerId(email: string): string {
  return `conta-${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = registerSchema.safeParse(form ? Object.fromEntries(form) : {});
  if (!parsed.success) {
    if (wantsJson(request)) return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    return backWithError(request);
  }

  const { email, returnUrl } = parsed.data;
  const customerId = syntheticCustomerId(email);
  const response = wantsJson(request) ? Response.json({ ok: true, customerId }) : sameOriginRedirect(request, returnUrl);
  response.headers.append('Set-Cookie', sessionCookieHeader(customerId));
  return response;
}
