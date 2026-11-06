// Logout SEM JS (Fase 9c, ADR 0027): contraparte de `DELETE /api/account/session`
// (que so faz sentido para fetch/JS - um <form> HTML nao tem metodo DELETE).
// O botao "Sair" de app/account/page.tsx chama este endpoint via
// <form method="POST">. Mesma disciplina do resto da area da conta: so limpa
// o cookie mock, nunca grava nem invalida nada num backend real.
import { clearSessionCookieHeader } from '../../../../../lib/auth/session';

/** `path` absoluto relativo a origem de `request`, nunca cruzando para outro host. */
function sameOriginRedirect(request: Request, path: string): Response {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });
}

export async function POST(request: Request) {
  const response = sameOriginRedirect(request, '/');
  response.headers.append('Set-Cookie', clearSessionCookieHeader());
  return response;
}
