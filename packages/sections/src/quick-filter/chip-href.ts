// URL de um chip de filtro rapido. Puro: testavel e estavel para SEO (parametros
// em ordem alfabetica, sempre o mesmo href para o mesmo conjunto de filtros).

export type ChipHref = { href: string; active: boolean; nofollow: boolean };

/**
 * Clicar num chip ativo remove o filtro (toggle); em um inativo, adiciona.
 * `nofollow` quando o resultado combina mais de uma faceta: combinacoes sao
 * espaco de crawl quase infinito (seo.relNofollowWhenMultiFacet).
 */
export function chipHref(
  basePath: string,
  current: Readonly<Record<string, string>>,
  chip: { facet: string; value: string },
): ChipHref {
  const active = current[chip.facet] === chip.value;
  const next: Record<string, string> = { ...current };
  if (active) delete next[chip.facet];
  else next[chip.facet] = chip.value;
  const query = Object.keys(next)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(next[k]!)}`)
    .join('&');
  return { href: query ? `${basePath}?${query}` : basePath || '?', active, nofollow: Object.keys(next).length > 1 };
}
