// Indice de slugs de 1o segmento (docs/adr/0003). Varias rotas compartilham a
// forma "/{x}": department, category-flat, campaign e institutional. Um slug
// pertence a UMA fonte; conflito ou slug reservado derruba o build
// (routes.manifest > resolution.slugIndex.onConflict: fail-build).
export type SlugRoute = 'department' | 'category-flat' | 'campaign' | 'institutional';
export type SlugEntry = { route: SlugRoute; slug: string };

export class SlugIndexError extends Error {
  constructor(readonly problems: string[]) {
    super(`Indice de slugs invalido:\n- ${problems.join('\n- ')}`);
    this.name = 'SlugIndexError';
  }
}

export function buildSlugIndex(
  sources: Record<SlugRoute, readonly string[]>,
  reserved: readonly string[],
): ReadonlyMap<string, SlugEntry> {
  const reservedSet = new Set(reserved);
  const index = new Map<string, SlugEntry>();
  const problems: string[] = [];

  for (const route of Object.keys(sources) as SlugRoute[]) {
    for (const slug of sources[route]) {
      if (reservedSet.has(slug)) {
        problems.push(`"${slug}" (${route}) e um slug reservado`);
        continue;
      }
      const existing = index.get(slug);
      if (existing) {
        problems.push(`"${slug}" aparece em ${existing.route} e em ${route}`);
        continue;
      }
      index.set(slug, { route, slug });
    }
  }

  if (problems.length > 0) throw new SlugIndexError(problems);
  return index;
}
