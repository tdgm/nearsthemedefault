import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonVariant } from '../button/button';
import { cn } from '../cn';

/**
 * Classes de botao de icone quadrado (44x44 minimo). Exportado para quem
 * precisa do MESMO visual num elemento que nao e `<button>` (ex.: `<a>` de
 * navegacao com so icone) ou que ja tem seu proprio wrapper client-side
 * (`OverlayTrigger`) - evita cada chamador reinventar radius/tamanho/hover
 * a mao e divergir do resto do sistema (ADR 0034).
 */
export const iconButtonClasses = (variant: ButtonVariant = 'tertiary'): string =>
  cn(buttonClasses({ variant, size: 'sm' }), 'relative size-11 min-w-11 p-0 no-underline');

/** Formata o nome acessivel com contagem ("Carrinho, 3 itens"). 0/undefined devolve so o rotulo. */
export const countLabel = (label: string, count = 0): string =>
  count > 0 ? `${label}, ${count > 99 ? '99+' : count} ${count === 1 ? 'item' : 'itens'}` : label;

/** Selo numerico sobre um icone (carrinho, favoritos). 0 ou undefined nao renderiza nada. */
export function CountBadge({ value }: { value?: number }) {
  if (!value || value <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-badge-promo-bg px-1 text-2xs font-bold text-badge-promo-on"
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> & {
  /** Nome acessivel. Obrigatorio: botao so com icone nao tem texto visivel. */
  label: string;
  /** Icone (SVG). Marcado aria-hidden aqui. */
  icon: ReactNode;
  variant?: ButtonVariant;
  /** Contador sobre o icone (carrinho, favoritos). 0 ou undefined nao mostra. */
  badge?: number;
};

/** Botao quadrado de no minimo 44x44px (CLAUDE.md > Acessibilidade). */
export function IconButton({ label, icon, variant = 'tertiary', badge = 0, type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={countLabel(label, badge)} className={cn(iconButtonClasses(variant), className)} {...rest}>
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
      <CountBadge value={badge} />
    </button>
  );
}
