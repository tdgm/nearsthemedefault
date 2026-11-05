"use client";
// Client Component (ilha minima): showModal() so existe no DOM, entao precisa de
// onClick. Tambem fecha ao clicar no backdrop. Nao guarda estado: o <dialog>
// nativo e a fonte da verdade, e nada hidrata antes da interacao.

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type OverlayTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> & {
  /** Id do `<Overlay>` a abrir. */
  targetId: string;
  children: ReactNode;
};

export function OverlayTrigger({ targetId, children, ...rest }: OverlayTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded="false"
      {...rest}
      onClick={(event) => {
        const button = event.currentTarget; // currentTarget some apos o handler
        const dialog = document.getElementById(targetId);
        if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
        dialog.showModal();
        button.setAttribute('aria-expanded', 'true');
        dialog.addEventListener('close', () => button.setAttribute('aria-expanded', 'false'), { once: true });
        // Clique no backdrop: o alvo do evento e o proprio <dialog>. Liga uma vez.
        if (!dialog.dataset.backdropBound) {
          dialog.dataset.backdropBound = 'true';
          dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
          });
        }
      }}
    >
      {children}
    </button>
  );
}
