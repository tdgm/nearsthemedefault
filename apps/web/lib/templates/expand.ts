// Expande a lista de um template de nears/sections.registry.yaml em instancias
// ordenadas. Puro e testavel: nao conhece conteudo, so a composicao.
import type { TemplateEntry } from '@nears/manifests';

export type SectionInstance = {
  id: string;
  variant?: string;
  /** Chave estavel para React: posicao + id. */
  key: string;
  /** n-esima ocorrencia de `id:variant` fora de repeats (0 para a primeira). */
  occurrence: number;
  /** Indice dentro do `repeat` de origem, quando houver. */
  repeatIndex?: number;
  repeatOver?: string;
};

function parseRef(ref: string): { id: string; variant?: string } {
  const [id = ref, variant] = ref.split(':');
  return variant ? { id, variant } : { id };
}

/**
 * `repeatCounts`: quantas vezes cada `over` (ex.: departments) se repete ja
 * aplicado o limite (o chamador le `limit.from` da config). Um `over` ausente
 * vira zero repeticoes.
 */
export function expandTemplate(
  entries: readonly TemplateEntry[],
  repeatCounts: Readonly<Record<string, number>>,
): SectionInstance[] {
  const seen = new Map<string, number>();
  const out: SectionInstance[] = [];

  const push = (ref: string, extra: Pick<SectionInstance, 'repeatIndex' | 'repeatOver'> = {}) => {
    const { id, variant } = parseRef(ref);
    let occurrence = 0;
    if (extra.repeatIndex === undefined) {
      const tag = `${id}:${variant ?? ''}`;
      occurrence = seen.get(tag) ?? 0;
      seen.set(tag, occurrence + 1);
    }
    out.push({
      id,
      ...(variant ? { variant } : {}),
      key: `${out.length}-${id}`,
      occurrence,
      ...extra,
    });
  };

  for (const entry of entries) {
    if (typeof entry === 'string') {
      push(entry);
      continue;
    }
    const { over, blocks } = entry.repeat;
    const count = repeatCounts[over] ?? 0;
    for (let i = 0; i < count; i += 1) {
      for (const block of blocks) push(block, { repeatIndex: i, repeatOver: over });
    }
  }
  return out;
}

/** Resolve `limit` de um repeat: numero literal ou caminho "a.b.c" na config. */
export function resolveRepeatLimit(
  limit: number | { from: string } | undefined,
  config: unknown,
): number | undefined {
  if (limit === undefined) return undefined;
  if (typeof limit === 'number') return limit;
  const value = limit.from.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], config);
  if (typeof value !== 'number') throw new Error(`repeat.limit.from "${limit.from}" nao e numero na config`);
  return value;
}

/** Quantas repeticoes de cada `over`: o menor entre o disponivel e o `limit` do template. */
export function repeatCountsFor(
  entries: readonly TemplateEntry[],
  available: Readonly<Record<string, number>>,
  config: unknown,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    if (typeof entry === 'string') continue;
    const { over, limit } = entry.repeat;
    const max = resolveRepeatLimit(limit, config);
    const have = available[over] ?? 0;
    counts[over] = max === undefined ? have : Math.min(have, max);
  }
  return counts;
}
