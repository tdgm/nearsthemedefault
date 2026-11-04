"use client";
// Client Component: precisa de ref + efeito para chamar showModal()/close() do <dialog>
// nativo, que entrega focus trap, Esc e inert no fundo sem biblioteca.

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../cn';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Titulo (nome acessivel do dialog). Obrigatorio. */
  title: string;
  children: ReactNode;
  /** `drawer` ancora o painel na lateral (minicart, filtros, menu). */
  variant?: 'modal' | 'drawer';
  side?: 'left' | 'right';
  closeLabel?: string;
  className?: string;
};

/**
 * Dialogo acessivel sobre `<dialog>` nativo: focus trap, Esc, fundo inerte e
 * retorno de foco ao gatilho (feito pelo navegador). Clique no backdrop fecha.
 */
export function Modal({ open, onClose, title, children, variant = 'modal', side = 'right', closeLabel = 'Fechar', className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${title.replace(/\W+/g, '-').toLowerCase()}-title`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const drawer = variant === 'drawer';
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        'bg-surface-raised text-on-surface backdrop:bg-black/50',
        drawer
          ? cn('m-0 h-dvh max-h-dvh w-[min(24rem,100vw)] max-w-none', side === 'right' ? 'ml-auto' : 'mr-auto')
          : 'm-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg',
        className,
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex size-11 items-center justify-center rounded-md"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
