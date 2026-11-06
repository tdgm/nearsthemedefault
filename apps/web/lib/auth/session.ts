// Sessao MOCK (Fase 9, ADR 0027): cookie opaco cujo valor e so o id de um
// cliente mock (`apps/web/lib/data/customer.ts`) - nunca um JWT, nunca uma
// senha real verificada. Este repo e frontend puro: nao ha backend de auth
// de verdade, so o suficiente para exercitar a area da conta.
// Helpers em texto puro (string <-> string), sem depender de `next/headers`,
// para serem testaveis sem mockar Request/Response do Next.
export const SESSION_COOKIE = 'nears_session';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/**
 * `Secure` exige HTTPS: em `pnpm dev` (http://localhost) o navegador
 * descartaria o cookie e o login nunca persistiria entre requisicoes. Mesmo
 * padrao de `apps/web/lib/manifest.ts`/`seo/site.ts` (checar NODE_ENV, nunca
 * desligar a regra de producao).
 */
function cookieAttrs(maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

/** Header `Set-Cookie` que inicia a sessao mock para `customerId`. */
export function sessionCookieHeader(customerId: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(customerId)}; ${cookieAttrs(THIRTY_DAYS_SECONDS)}`;
}

/** Header `Set-Cookie` que encerra a sessao mock (logout). */
export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; ${cookieAttrs(0)}`;
}

/** Id do cliente mock a partir do header `Cookie` de uma requisicao, ou `null` sem sessao. */
export function readSessionCustomerId(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    if (name !== SESSION_COOKIE) continue;
    const value = part.slice(separator + 1).trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  return null;
}
