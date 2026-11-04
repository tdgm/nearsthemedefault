import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export type BadgeVariant = 'neutral' | 'promo' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

// Pares conferidos em nears/contracts.yaml > gates.accessibility.contrastPairs.
const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-subtle text-on-surface border border-border',
  promo: 'bg-badge-promo-bg text-badge-promo-on',
  success: 'bg-surface-subtle text-success border border-border',
  warning: 'bg-surface-subtle text-warning border border-border',
  danger: 'bg-surface-subtle text-danger border border-border',
  info: 'bg-surface-subtle text-info border border-border',
};

/** Tag curta (ex.: "Novo", "-20%", "Esgotado"). Nunca a unica forma de transmitir um estado critico. */
export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variants[variant], className)}
    >
      {children}
    </span>
  );
}
