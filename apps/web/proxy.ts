import { NextResponse, type NextRequest } from 'next/server';
import { NOT_FOUND_REWRITE, isKnownPath } from './lib/routing/known-path';

// Proxy (middleware do Next 16). Unica funcao: URL que nao existe responde 404 de
// verdade ja na PRIMEIRA requisicao (lib/routing/known-path, docs/adr/0021).
// Nao le cookie nem header de requisicao e nao muda o que as paginas renderizam,
// entao nao torna nenhuma rota dinamica.
export async function proxy(request: NextRequest) {
  if (await isKnownPath(request.nextUrl.pathname)) return NextResponse.next();
  return NextResponse.rewrite(new URL(NOT_FOUND_REWRITE, request.url));
}

export const config = {
  // Fora: handlers de API, assets do Next e qualquer arquivo com extensao
  // (robots.txt, llms.txt, sitemap/*.xml, imagens).
  matcher: ['/((?!api/|_next/|.*\\..*).*)'],
};
