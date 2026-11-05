import type { ReactNode } from 'react';
import { cn } from '../cn';

export type OverlayProps = {
  /** Id usado pelo gatilho (`OverlayTrigger targetId`). */
  id: string;
  /** Titulo visivel; vira o nome acessivel do dialogo. Obrigatorio. */
  title: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'center';
  closeLabel?: string;
  className?: string;
};

/**
 * Painel lateral sobre `<dialog>` nativo, renderizado no SERVIDOR: o conteudo
 * (links, itens) ja esta no HTML inicial, indexavel, e nenhum JS e necessario
 * para fecha-lo (`<form method="dialog">`). Abrir e Esc/focus trap sao do
 * navegador (`showModal()`), disparado por `OverlayTrigger`.
 */
export function Overlay({ id, title, children, side = 'left', closeLabel = 'Fechar', className }: OverlayProps) {
  const titleId = `${id}-title`;
  return (
    <dialog
      id={id}
      aria-labelledby={titleId}
      data-overlay
      className={cn(
        'max-w-none bg-surface-raised p-0 text-on-surface backdrop:bg-black/50',
        // `center`: modal de conteudo largo (ex.: zoom de imagem); lateral: painel de altura total.
        side === 'center' ? 'm-auto max-h-dvh w-[min(64rem,100vw)]' : 'm-0 h-dvh max-h-dvh w-[min(24rem,100vw)]',
        side === 'right' && 'ml-auto',
        side === 'left' && 'mr-auto',
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <form method="dialog">
            <button type="submit" aria-label={closeLabel} className="inline-flex size-11 items-center justify-center rounded-md">
              <span aria-hidden="true">✕</span>
            </button>
          </form>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
