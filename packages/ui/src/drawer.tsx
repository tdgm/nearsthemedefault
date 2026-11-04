'use client';

import * as Radix from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { IconButton } from './icon-button';
import { cx } from './cx';

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: 'left' | 'right';
};

function CloseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

const sides = {
  left: 'inset-y-0 left-0 data-[state=closed]:-translate-x-full',
  right: 'inset-y-0 right-0 data-[state=closed]:translate-x-full',
};

/** Deslizante lateral, para minicart e nav-drawer. Mesmo focus trap/Esc do Modal (Radix Dialog). */
export function Drawer({ open, onOpenChange, title, children, side = 'right' }: DrawerProps) {
  return (
    <Radix.Root open={open} onOpenChange={onOpenChange}>
      <Radix.Portal>
        <Radix.Overlay className="fixed inset-0 z-40 bg-surface-inverse/50" />
        <Radix.Content
          className={cx(
            'fixed z-50 flex w-[min(24rem,90vw)] flex-col gap-4 bg-surface p-4 shadow-overlay',
            'transition-transform duration-[var(--nears-duration-base)] ease-standard data-[state=open]:translate-x-0',
            sides[side],
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <Radix.Title className="text-lg font-bold text-on-surface">{title}</Radix.Title>
            <Radix.Close asChild>
              <IconButton aria-label="Fechar" variant="ghost" size="sm" icon={<CloseIcon />} />
            </Radix.Close>
          </div>
          <Radix.Description className="sr-only">{title}</Radix.Description>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
