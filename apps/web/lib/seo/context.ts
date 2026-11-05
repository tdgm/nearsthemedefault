import { getStore } from '../data/client';
import { loadRoutes } from '../manifest';
import type { SeoContext } from './jsonld';
import { siteUrl } from './site';

/** Contexto dos construtores de JSON-LD: URL publica + entidade da loja (data layer). */
export async function getSeoContext(): Promise<SeoContext> {
  return { site: siteUrl(), store: await getStore() };
}

/** Padrao da rota de busca no manifest (alvo do SearchAction). */
export function searchPath(): string {
  return loadRoutes().find((r) => r.id === 'search')?.pattern ?? '/s';
}
