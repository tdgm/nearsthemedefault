'use client';

import { useEffect, type ReactNode } from 'react';
import { IconButton } from './icon-button';
import { cx } from './cx';

export type ToastProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'danger';
  /** ms antes de fechar sozinho; omitido = so fecha pelo X. */
  duration?: number;
};

const variants = {
  neutral: 'bg-surface-inverse text-on-inverse',
  success: 'bg-surface text-success border border-border',
  danger: 'bg-surface text-danger border border-border',
};

/**
 * Notificacao curta. `role="status"` + `aria-live="polite"` anunciam o
 * conteudo sem roubar o foco (CLAUDE.md > Acessibilidade: "Adicionar ao
 * carrinho anuncia resultado em aria-live=polite" usa este padrao).
 */
export function Toast({ open, onClose, children, variant = 'neutral', duration }: ToastProps) {
  useEffect(() => {
    if (!open || !duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx('flex items-center gap-3 rounded-md px-4 py-3 shadow-md', variants[variant])}
    >
      <span className="text-sm">{children}</span>
      <IconButton
        aria-label="Fechar notificação"
        variant="ghost"
        size="sm"
        onClick={onClose}
        icon={
          <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        }
      />
    </div>
  );
}
