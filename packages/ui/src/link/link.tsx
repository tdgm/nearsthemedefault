import type { AnchorHTMLAttributes, ElementType } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '../button/button';
import { cn } from '../cn';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** `inline` dentro de texto (sublinhado sempre); `standalone` em menus e listas. */
  variant?: 'inline' | 'standalone';
  /** Troca o elemento (ex.: next/link) mantendo estilo e acessibilidade. */
  as?: ElementType;
  /** Link externo: abre em nova aba com rel seguro e avisa leitores de tela. */
  external?: boolean;
  /** Mostra o link com a aparencia de um Button (a semantica continua sendo de link). */
  appearance?: { variant?: ButtonVariant; size?: ButtonSize };
};

const variants = {
  inline: 'underline underline-offset-4',
  standalone: 'no-underline hover:underline underline-offset-4',
};

/**
 * Link com texto descritivo (nunca "clique aqui": ancora descritiva e regra de
 * SEO, CLAUDE.md). Area de toque de 44px na vertical via `min-h-11` no modo standalone.
 */
export function Link({ variant = 'inline', as, external, appearance, className, children, ...rest }: LinkProps) {
  const Component = as ?? 'a';
  return (
    <Component
      className={cn(
        appearance
          ? buttonClasses({ variant: appearance.variant ?? 'primary', size: appearance.size ?? 'md' })
          : cn(
              'text-link rounded-sm',
              variants[variant],
              variant === 'standalone' && 'inline-flex min-h-11 items-center',
            ),
        className,
      )}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
      {external && <span className="sr-only">, abre em nova aba</span>}
    </Component>
  );
}
