import { cn } from '../cn';

export type RatingProps = {
  /** Nota de 0 a 5 (aceita decimais). */
  value: number;
  /** Total de avaliacoes. */
  count?: number;
  size?: 'sm' | 'md';
  /** Texto-base lido por leitores de tela. */
  label?: string;
  className?: string;
};

const STAR = 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z';

const Stars = ({ className }: { className: string }) => (
  <span className={cn('flex', className)} aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      // `w-1/5` (1 de 5 estrelas) + `h-full`: `size-full` antigo pedia 100% da largura do
      // container PARA CADA estrela e `shrink-0` proibia encolher, entao as 5 se sobrepunham
      // e estouravam a largura em ~5x (bug real medido na PDP: 65px de overflow horizontal
      // no mobile, reproduzido via Playwright em iPhone 13).
      <svg key={i} viewBox="0 0 24 24" className="h-full w-1/5 shrink-0" fill="currentColor">
        <path d={STAR} />
      </svg>
    ))}
  </span>
);

/**
 * Estrelas + nota numerica + total. As estrelas sao decorativas (aria-hidden);
 * a alternativa em texto diz "Avaliacao 4,5 de 5, 128 avaliacoes".
 */
export function Rating({ value, count, size = 'md', label = 'Avaliação', className }: RatingProps) {
  const v = Math.min(5, Math.max(0, value));
  const text = v.toFixed(1).replace('.', ',');
  const star = size === 'sm' ? 'h-4 w-[5rem]' : 'h-5 w-[6.25rem]';
  return (
    <p className={cn('flex items-center gap-2 text-sm', className)}>
      <span className={cn('relative inline-block', star)}>
        <Stars className={cn('absolute inset-0 text-on-surface-faint', star)} />
        {/* Camada preenchida cortada em v/5 da largura: aceita meias estrelas e decimais. */}
        <span className="absolute inset-y-0 left-0 overflow-hidden text-on-surface" style={{ width: `${(v / 5) * 100}%` }}>
          <Stars className={cn('text-on-surface', star)} />
        </span>
      </span>
      <span>
        <span className="sr-only">
          {label} {text} de 5
          {count !== undefined ? `, ${count} ${count === 1 ? 'avaliação' : 'avaliações'}` : ''}
        </span>
        <span aria-hidden="true">
          {text}
          {count !== undefined && <span className="text-on-surface-muted"> ({count})</span>}
        </span>
      </span>
    </p>
  );
}
