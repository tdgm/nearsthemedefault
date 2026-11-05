// URL publica da loja. Hoje single-tenant: vem de SITE_URL (variavel server-only,
// nunca NEXT_PUBLIC_*). Com multi-tenancy o resolver de dominio (docs/adr/0016)
// passa a fornecer a base POR LOJA, ja validada contra a allowlist do painel; o
// header Host cru nunca e usado aqui (host header injection / cache poisoning).

const FALLBACK = 'http://localhost:3000';
let warned = false;

export function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === 'production' && !warned) {
      warned = true;
      console.warn(`[seo] SITE_URL nao definida: canonical, sitemap e JSON-LD usam ${FALLBACK}. Defina SITE_URL no ambiente de producao.`);
    }
    return FALLBACK;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL invalida: "${raw}"`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`SITE_URL precisa ser http(s): "${raw}"`);
  return url.origin;
}

/** Caminho (`/x?page=2`) -> URL absoluta. Aceita so caminhos da propria loja. */
export function absoluteUrl(path: string, site: string = siteUrl()): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error(`absoluteUrl espera caminho iniciado por "/": "${path}"`);
  return `${site}${path}`;
}

/** Mesma regra para imagens: URL absoluta passa, caminho relativo ganha a base. */
export function absoluteAsset(src: string, site: string = siteUrl()): string {
  return /^https?:\/\//.test(src) ? src : absoluteUrl(src.startsWith('/') ? src : `/${src}`, site);
}
