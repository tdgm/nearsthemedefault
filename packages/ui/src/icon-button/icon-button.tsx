import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonVariant } from '../button/button';
import { cn } from '../cn';

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
export function IconButton({ label, icon, variant = 'tertiary', badge, type = 'button', className, ...rest }: IconButtonProps) {
  const count = badge && badge > 0 ? badge : 0;
  return (
    <button
      type={type}
      aria-label={count ? `${label}, ${count} ${count === 1 ? 'item' : 'itens'}` : label}
      className={cn(
        buttonClasses({ variant, size: 'sm' }),
        'relative size-11 min-w-11 p-0 no-underline',
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-badge-promo-bg px-1 text-2xs font-bold text-badge-promo-on"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
