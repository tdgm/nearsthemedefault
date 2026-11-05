import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type BadgeTone = 'neutral' | 'promo' | 'success' | 'warning' | 'danger' | 'info';

// promo usa o par badge-promo (checado em tokens:contrast); os demais sao texto
// colorido sobre a superficie (pares success/warning/danger/info, ADR 0011).
const tones: Record<BadgeTone, string> = {
  neutral: 'border border-border-control text-on-surface-muted',
  promo: 'bg-badge-promo-bg text-badge-promo-on',
  success: 'border border-success text-success',
  warning: 'border border-warning text-warning',
  danger: 'border border-danger text-danger',
  info: 'border border-info text-info',
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

/** Etiqueta curta (ex.: "-20%", "Novo", "Esgotado"). Informativa, nao interativa. */
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs leading-snug font-bold whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
