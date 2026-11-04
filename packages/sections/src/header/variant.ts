// Variante do header por padrao de rota (nears/sections.registry.yaml >
// globals.header.variantRules). Puro e sem JSX: testavel e carregavel em Node.

export type HeaderVariant = 'full' | 'minimal' | 'none';
export type VariantRule = { pattern: string; variant: HeaderVariant };

/** Glob de caminho: `*` casa exatamente um segmento (`*/p` -> `/camiseta/p`). */
export function matchesPattern(pattern: string, path: string): boolean {
  const segments = (v: string) => v.split('/').filter(Boolean);
  const p = segments(pattern);
  const s = segments(path);
  return p.length === s.length && p.every((seg, i) => seg === '*' || seg === s[i]);
}

/** Primeira regra que casa vence; sem regra, `full`. */
export function resolveHeaderVariant(path: string, rules: readonly VariantRule[]): HeaderVariant {
  return rules.find((r) => matchesPattern(r.pattern, path))?.variant ?? 'full';
}
