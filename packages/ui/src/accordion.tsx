import { useId, type ReactNode } from 'react';
import { cx } from './cx';

export type AccordionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * <details>/<summary> nativos: zero JS, Server Component, foco/teclado/
 * anuncio de aberto-fechado ja vem do navegador. O atributo `name` (Baseline
 * 2024) da exclusividade nativa entre os itens do mesmo Accordion, sem
 * reimplementar o comportamento de "so um aberto por vez" em JS.
 */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cx('divide-y divide-border', className)}>{children}</div>;
}

export type AccordionItemProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Mesmo `name` em todos os itens do grupo = so um aberto por vez (nativo). Omitido = independentes. */
  name?: string;
};

export function AccordionItem({ title, children, defaultOpen, name }: AccordionItemProps) {
  const id = useId();
  return (
    <details name={name} open={defaultOpen} className="group py-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-md font-medium text-on-surface">
        {title}
        <svg
          className="size-4 shrink-0 transition-transform duration-[var(--nears-duration-fast)] group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </summary>
      <div id={id} className="pt-2 text-md text-on-surface-muted">
        {children}
      </div>
    </details>
  );
}
