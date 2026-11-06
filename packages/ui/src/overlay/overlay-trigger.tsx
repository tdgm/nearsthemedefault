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

// `showModal()` torna o resto da pagina inerte para foco, mas o navegador NAO bloqueia
// o scroll do documento por conta propria: wheel/touch na area fora do dialog (que nao e
// um scroll container) sobe ate o `<html>`, que continua rolavel por baixo do painel fixo.
// Sem isto, no touch isso aparenta "travar" a navegacao (o dedo rola o fundo, nao o menu).
function lockScroll() {
  const { style } = document.documentElement;
  if (style.overflow === 'hidden') return; // ja travado por outro overlay
  style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
}

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
        lockScroll();
        dialog.showModal();
        button.setAttribute('aria-expanded', 'true');
        dialog.addEventListener(
          'close',
          () => {
            button.setAttribute('aria-expanded', 'false');
            unlockScroll();
          },
          { once: true },
        );
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
