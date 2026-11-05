// "Esta URL existe?" respondido ANTES de renderizar. Motivo: com cacheComponents
// o Next serve um shell de fallback para parametros fora de generateStaticParams;
// o status HTTP sai como 200 e um notFound() dentro da pagina so vira 404 a partir
// da 2a requisicao (a resposta e cacheada como 404). Isso e um soft 404 para o
// crawler que bate primeiro na URL (docs/adr/0003: "onMiss: not-found, nunca soft
// 404"). O proxy usa esta funcao para reescrever URL desconhecida para um caminho
// sem rota, que o Next responde com 404 de verdade na primeira requisicao.
import { loadAllManifests } from '../manifest';
import { resolveLongtail, resolveProduct, resolveSegments } from './resolve';

/** Raizes que nao passam pelo indice de slugs: rotas de arquivo/handler fora do manifest de paginas. */
const FRAMEWORK_ROOTS = ['api', 'sitemap'] as const;

/** Primeiros segmentos LITERAIS do routes.manifest (ex.: s, b, mapa-do-site, 404). */
function literalRoots(): Set<string> {
  const roots = new Set<string>(FRAMEWORK_ROOTS);
  for (const route of loadAllManifests().routes.routes) {
    const first = route.pattern.split('/')[1];
    if (first && !first.startsWith('{')) roots.add(first);
  }
  return roots;
}

const decode = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

export async function isKnownPath(pathname: string): Promise<boolean> {
  const raw = pathname.split('/').filter(Boolean).map(decode);
  if (raw.some((s) => s === null)) return false;
  const segments = raw as string[];
  const [first, second] = segments;
  if (!first) return true; // home
  if (first === 'b') return segments.length === 2 && second !== undefined && (await resolveLongtail(second)) !== null;
  if (literalRoots().has(first)) return true; // /s, /mapa-do-site, /api/..., /sitemap/...: a propria rota decide
  if (segments.length === 2 && second === 'p') return (await resolveProduct(first)) !== null;
  if (segments.length > 3) return false;
  return (await resolveSegments(segments)) !== null;
}

/** Caminho sem nenhuma rota: o Next responde 404 de verdade (e renderiza app/not-found.tsx). */
export const NOT_FOUND_REWRITE = '/nao-encontrado/1/2/3/4';
