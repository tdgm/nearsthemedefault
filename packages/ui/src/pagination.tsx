import { Link } from './link';
import { cx } from './cx';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Monta a URL de cada pagina (ex.: (p) => `/categoria/tenis?page=${p}`). */
  buildHref: (page: number) => string;
};

/**
 * Server Component, links reais (nao botoes com JS) - indexavel sem
 * JavaScript (CLAUDE.md > SEO) e rel="prev"/"next" nos vizinhos da pagina
 * atual (CLAUDE.md > SEO: "paginacao indexavel com rel prev/next").
 */
export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginação">
      <ul className="flex items-center gap-1">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          let rel: 'prev' | 'next' | undefined;
          if (page === currentPage - 1) rel = 'prev';
          else if (page === currentPage + 1) rel = 'next';

          return (
            <li key={page}>
              <Link
                href={buildHref(page)}
                rel={rel}
                variant="muted"
                aria-current={isCurrent ? 'page' : undefined}
                className={cx(
                  'flex min-h-11 min-w-11 items-center justify-center rounded-md text-md',
                  isCurrent && 'bg-surface-subtle font-bold text-on-surface',
                )}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
