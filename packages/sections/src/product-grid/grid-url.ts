// URLs do grid de produtos. Puro: testavel e estavel para SEO (parametros em
// ordem alfabetica; a pagina 1 e a URL limpa, sem `page`).

export type GridQuery = Readonly<Record<string, string | readonly string[]>>;

/** `?a=1&b=2` a partir de pares, valores repetidos viram repeticao do parametro. */
export function toQueryString(query: GridQuery): string {
  const pairs: string[] = [];
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    const values = Array.isArray(value) ? [...value].sort() : [value as string];
    for (const v of values) if (v !== '' && v !== undefined) pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return pairs.length ? `?${pairs.join('&')}` : '';
}

/** href da pagina `page` preservando os demais parametros; pagina 1 = URL limpa. */
export function pageHref(basePath: string, query: GridQuery, page: number): string {
  const rest: GridQuery = Object.fromEntries(Object.entries(query).filter(([key]) => key !== 'page'));
  const next: GridQuery = page > 1 ? { ...rest, page: String(page) } : rest;
  return `${basePath}${toQueryString(next)}` || '?';
}
