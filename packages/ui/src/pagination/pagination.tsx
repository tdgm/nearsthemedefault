import { cn } from '../cn';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** URL indexavel de cada pagina (?page=N). A pagina 1 deve ser a URL limpa. */
  hrefFor: (page: number) => string;
  /** Paginas mostradas em cada lado da atual. */
  siblings?: number;
  labels?: { nav: string; previous: string; next: string; page: (n: number) => string };
  className?: string;
};

const defaultLabels = {
  nav: 'Paginação',
  previous: 'Página anterior',
  next: 'Próxima página',
  page: (n: number) => `Página ${n}`,
};

/** Janela de paginas com reticencias: [1, '…', 4, 5, 6, '…', 20]. */
export function pageWindow(current: number, total: number, siblings: number): (number | 'gap')[] {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= siblings; i++) {
    pages.add(current - i);
    pages.add(current + i);
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const item = 'inline-flex size-11 items-center justify-center rounded-control border border-border-control';

/**
 * Paginacao SEO-friendly: links reais (`<a href>`), `rel="prev"/"next"` e
 * `aria-current="page"`. Funciona sem JavaScript.
 */
export function Pagination({ currentPage, totalPages, hrefFor, siblings = 1, labels = defaultLabels, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const l = { ...defaultLabels, ...labels };
  const disabled = cn(item, 'cursor-not-allowed opacity-50');
  return (
    <nav aria-label={l.nav} className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <a href={hrefFor(currentPage - 1)} rel="prev" aria-label={l.previous} className={item}>
              <span aria-hidden="true">‹</span>
            </a>
          ) : (
            <span aria-disabled="true" className={disabled}>
              <span className="sr-only">{l.previous}</span>
              <span aria-hidden="true">‹</span>
            </span>
          )}
        </li>
        {pageWindow(currentPage, totalPages, siblings).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-on-surface-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <a
                href={hrefFor(p)}
                aria-label={l.page(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={cn(item, p === currentPage && 'border-2 border-on-surface font-bold')}
              >
                {p}
              </a>
            </li>
          ),
        )}
        <li>
          {currentPage < totalPages ? (
            <a href={hrefFor(currentPage + 1)} rel="next" aria-label={l.next} className={item}>
              <span aria-hidden="true">›</span>
            </a>
          ) : (
            <span aria-disabled="true" className={disabled}>
              <span className="sr-only">{l.next}</span>
              <span aria-hidden="true">›</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
