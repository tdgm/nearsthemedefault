import { Fragment } from 'react';
import { cn } from '../cn';

export type BreadcrumbItem = { label: string; href?: string };

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** Nome do landmark (microcopy). */
  label?: string;
  className?: string;
};

/**
 * Trilha de navegacao: `<nav>` + `<ol>`. O ultimo item e a pagina atual
 * (`aria-current="page"`, sem link). Separadores aria-hidden. O JSON-LD
 * BreadcrumbList sai de /lib/seo com os mesmos itens.
 */
export function Breadcrumb({ items, label = 'Você está em', className }: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center text-sm">
        {items.map((item, i) => {
          const current = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className="flex items-center">
                {item.href && !current ? (
                  <a href={item.href} className="inline-flex min-h-11 items-center text-link underline underline-offset-4">
                    {item.label}
                  </a>
                ) : (
                  <span aria-current={current ? 'page' : undefined} className={cn(current && 'font-medium text-on-surface')}>
                    {item.label}
                  </span>
                )}
                {!current && (
                  <span aria-hidden="true" className="px-2 text-on-surface-muted">
                    ›
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
