import { Fragment } from 'react';
import { Link } from './link';

export type BreadcrumbItem = { label: string; href?: string };

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

/**
 * Server Component puro. O JSON-LD BreadcrumbList e gerado separadamente
 * por /lib/seo (CLAUDE.md: "JSON-LD gerado por helper tipado em /lib/seo"),
 * nao aqui - este componente so renderiza o HTML visivel/indexavel.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-on-surface-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link href={item.href} variant="muted">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-on-surface' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-on-surface-faint">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
