import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { cn } from '../cn';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Todos os tamanhos respeitam o alvo de toque minimo de 44px (min-h-11 = 44px).
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-5 text-md',
  lg: 'min-h-14 px-6 text-lg',
};

// Cores so por token semantico (nunca literal). Pares de contraste checados em
// `pnpm tokens:contrast` (action-on/action, link e danger sobre as superficies).
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-action text-action-on hover:bg-action-hover active:bg-action-hover',
  secondary:
    'border border-border-control bg-surface text-on-surface hover:bg-surface-subtle active:bg-surface-raised',
  tertiary: 'bg-transparent text-link underline underline-offset-4 hover:bg-surface-subtle active:bg-surface-raised',
  danger: 'border border-danger bg-surface text-danger hover:bg-surface-subtle active:bg-surface-raised',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-control select-none ' +
  'transition-colors duration-(--nears-duration-fast) ease-standard ' +
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50';

/** Classes de botao para reusar em outros elementos (ex.: <Link> com cara de CTA). */
export const buttonClasses = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean } = {}): string =>
  cn(base, variants[variant], sizes[size], fullWidth && 'w-full');

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Estado de carregamento: bloqueia o clique, anuncia `loadingLabel` e mostra o spinner. */
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading = false,
  loadingLabel = 'Carregando',
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  // `aria-disabled` em vez de `disabled` no loading: o botao mantem o foco
  // (nao some do teclado no meio da acao) e o clique e ignorado.
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) return e.preventDefault();
    onClick?.(e);
  };
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      // Sem handler quando nao ha onClick nem loading: Server Components nao serializam
      // funcoes em props, entao `<Button>` renderizado no servidor (ex.: submit de form) quebrava o build.
      onClick={loading || onClick ? handleClick : undefined}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
      {loading && <span className="sr-only">{loadingLabel}</span>}
    </button>
  );
}
