import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import { cx } from './cx';

export type LinkVariant = 'default' | 'muted' | 'inline';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * Componente a renderizar no lugar de `<a>` (ex.: `next/link`). O
   * apps/web injeta `next/link` aqui; este pacote nao depende de Next
   * para continuar testavel/isolado no Storybook e no Vitest.
   */
  as?: ElementType;
  variant?: LinkVariant;
  children?: ReactNode;
};

const variants: Record<LinkVariant, string> = {
  default: 'text-link underline-offset-2 hover:underline',
  muted: 'text-on-surface-muted underline-offset-2 hover:underline hover:text-on-surface',
  inline: 'text-link underline',
};

export function Link({ as: Component = 'a', variant = 'default', className, children, ...props }: LinkProps) {
  const external = props.target === '_blank';
  return (
    <Component
      {...props}
      rel={external ? cx('noopener noreferrer', props.rel) : props.rel}
      className={cx(variants[variant], className)}
    >
      {children}
      {external && (
        <span className="sr-only"> (abre em nova aba)</span>
      )}
    </Component>
  );
}
