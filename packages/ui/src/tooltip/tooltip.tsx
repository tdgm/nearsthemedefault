import type { ReactNode } from 'react';
import { cn } from '../cn';

export type TooltipProps = {
  /** Texto da dica. Curto; nunca coloque informacao essencial so aqui. */
  content: string;
  /** Elemento focavel que recebe a dica. */
  children: ReactNode;
  /** Id do tooltip; o gatilho deve apontar `aria-describedby` para ele. */
  id: string;
  className?: string;
};

/**
 * Dica CSS-only (Server Component, zero JS): aparece no hover e no foco do
 * gatilho (`group-focus-within`) e some com `prefers-reduced-motion` sem
 * animacao. Conecte o gatilho com `aria-describedby={id}`.
 */
export function Tooltip({ content, children, id, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-60 -translate-x-1/2 rounded-md bg-surface-inverse px-2 py-1 text-sm text-on-inverse opacity-0 transition-opacity duration-(--nears-duration-fast) group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
