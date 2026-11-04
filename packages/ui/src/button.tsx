import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra spinner e desabilita o clique, sem mudar o layout (evita CLS). */
  loading?: boolean;
  /** Ocupa 100% da largura do container - util no CTA sticky mobile. */
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
  'duration-[var(--nears-duration-fast)] ease-standard disabled:cursor-not-allowed disabled:opacity-50';

const sizes: Record<ButtonSize, string> = {
  // min-h garante o alvo de toque >= 44px (CLAUDE.md > Acessibilidade) mesmo no sm.
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-md',
  lg: 'min-h-12 px-6 text-lg',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-action text-action-on hover:bg-action-hover',
  secondary: 'bg-surface-subtle text-on-surface hover:bg-surface-raised border border-border',
  outline: 'bg-transparent text-on-surface border border-border-control hover:bg-surface-subtle',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-subtle',
};

/** Spinner inline, 1em, respeita prefers-reduced-motion (regra global em styles.css/globals.css). */
function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/**
 * Botao com 4 variantes x 3 tamanhos. `loading` desabilita o clique mas
 * mantem o texto visivel (lido por leitor de tela) - so o icone muda.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
    >
      {loading ? <Spinner /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  );
}
