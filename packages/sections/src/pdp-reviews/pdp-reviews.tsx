import { Rating, formatDate } from '@nears/ui';
import { fill } from '../shared/template.ts';
import { RichText } from '../shared/rich-text.tsx';
import type { PdpReviewsProps } from './pdp-reviews.schema';

const defaults = {
  title: 'Avaliações de clientes',
  empty: 'Este produto ainda não tem avaliações.',
  verified: 'Fonte: {provider}',
  shown: 'Mostrando {n} de {total} avaliações.',
} as const;

/**
 * Avaliacoes: o agregado e as avaliacoes vem no HTML inicial (SSR), com a nota em
 * texto alternativo (Rating) e a data em `<time>`. Aggregate e Review entram no
 * JSON-LD do Product (Fase 7) com os mesmos dados. Sem avaliacoes, a secao
 * continua no DOM (e destino de `#avaliacoes`) e explica o vazio.
 */
export function PdpReviews({ provider, aggregate, items = [], labels }: PdpReviewsProps) {
  const l = { ...defaults, ...labels };
  const total = aggregate?.count ?? items.length;
  return (
    <section id="avaliacoes" aria-labelledby="avaliacoes-titulo" data-provider={provider} className="py-6 [contain-intrinsic-size:auto_360px] [content-visibility:auto]">
      <h2 id="avaliacoes-titulo" className="mb-3 text-xl font-bold">
        {l.title}
      </h2>
      {aggregate && aggregate.count > 0 ? <Rating value={aggregate.rating} count={aggregate.count} /> : <p className="text-on-surface-muted">{l.empty}</p>}
      {items.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {items.map((r, i) => (
              <li key={`${r.author}-${i}`} className="grid gap-1 py-4">
                <article>
                  <Rating value={r.rating} size="sm" />
                  {r.title && <h3 className="mt-1 font-medium">{r.title}</h3>}
                  <RichText text={r.body} className="mt-1" />
                  <p className="mt-2 text-sm text-on-surface-muted">
                    {r.author} · <time dateTime={r.date}>{formatDate(r.date)}</time>
                  </p>
                </article>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-on-surface-muted">
            {fill(l.shown, { n: items.length, total })} {fill(l.verified, { provider })}
          </p>
        </>
      )}
    </section>
  );
}
