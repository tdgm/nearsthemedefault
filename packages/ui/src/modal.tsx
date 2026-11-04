'use client';

// Radix Dialog e permitido explicitamente (CLAUDE.md > Stack: overlay/dialog).
// Focus trap, fechamento por Esc e clique fora ja vem da primitiva.
import * as Radix from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { IconButton } from './icon-button';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

function CloseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

/** Centrado, para decisoes curtas (confirmar, guia de medidas). Para navegacao/carrinho, use Drawer. */
export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Radix.Root open={open} onOpenChange={onOpenChange}>
      <Radix.Portal>
        <Radix.Overlay className="fixed inset-0 z-40 bg-surface-inverse/50" />
        <Radix.Content className="fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-6 shadow-overlay">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Radix.Title className="text-lg font-bold text-on-surface">{title}</Radix.Title>
            <Radix.Close asChild>
              <IconButton aria-label="Fechar" variant="ghost" size="sm" icon={<CloseIcon />} />
            </Radix.Close>
          </div>
          <Radix.Description className="sr-only">{title}</Radix.Description>
          {children}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
