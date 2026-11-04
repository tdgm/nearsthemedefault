const MAX_STARS = 5;

export type RatingProps = {
  /** Nota de 0 a 5 (aceita fracao, ex.: 4.3). */
  value: number;
  /** Numero de avaliacoes, exibido ao lado (ex.: "(128)"). */
  count?: number;
  max?: number;
};

function Star({ fillPercent }: { fillPercent: number }) {
  return (
    <span className="relative inline-block size-4" aria-hidden="true">
      <svg className="absolute inset-0 text-border-strong" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8L10 1.5Z" />
      </svg>
      <span className="absolute inset-0 overflow-hidden text-warning" style={{ width: `${fillPercent}%` }}>
        <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8L10 1.5Z" />
        </svg>
      </span>
    </span>
  );
}

/** Estrelas decorativas; a nota real vai no texto acessivel (aria-label), nao nas estrelas. */
export function Rating({ value, count, max = MAX_STARS }: RatingProps) {
  const label = count === undefined ? `${value} de ${max} estrelas` : `${value} de ${max} estrelas, ${count} avaliações`;

  return (
    <div role="img" aria-label={label} className="inline-flex items-center gap-1">
      <span className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const fillPercent = Math.max(0, Math.min(1, value - i)) * 100;
          return <Star key={i} fillPercent={fillPercent} />;
        })}
      </span>
      {count !== undefined && <span className="text-sm text-on-surface-muted">({count})</span>}
    </div>
  );
}
