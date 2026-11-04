import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  side?: 'top' | 'bottom';
};

/**
 * CSS-only (sem JS, sem Radix - "tooltip" nao esta na lista de primitivas
 * permitidas do CLAUDE.md > Stack). Aparece em :hover e :focus-within, e o
 * gatilho ganha aria-describedby - funciona com JS desabilitado tambem.
 */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const id = useId();
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': id })
    : children;

  return (
    <span className="group relative inline-flex">
      {trigger}
      <span
        role="tooltip"
        id={id}
        className={[
          'pointer-events-none invisible absolute z-10 w-max max-w-56 rounded-md bg-surface-inverse px-2 py-1',
          'text-xs text-on-inverse opacity-0 shadow-md transition-opacity duration-[var(--nears-duration-fast)]',
          'group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
          side === 'top' ? 'bottom-full left-1/2 mb-2 -translate-x-1/2' : 'top-full left-1/2 mt-2 -translate-x-1/2',
        ].join(' ')}
      >
        {content}
      </span>
    </span>
  );
}
