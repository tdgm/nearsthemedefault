import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '../cn';

/** Classes do container de pagina: reusar direto quando o elemento root da section ja existe (`cn(containerClasses, 'mb-20')`). */
export const containerClasses = 'mx-auto max-w-7xl px-4';

type ContainerOwnProps<T extends ElementType> = {
  /** Elemento semantico a renderizar (section, nav, footer...). Default: div. */
  as?: T;
  className?: string;
};

export type ContainerProps<T extends ElementType = 'div'> = ContainerOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ContainerOwnProps<T>>;

/**
 * Container de pagina: `mx-auto max-w-7xl px-4`, o mesmo gutter/largura maxima
 * usado em toda section. Centraliza o valor que antes era repetido a mao em
 * mais de uma duzia de componentes (ADR 0034) - uma mudanca de breakpoint/
 * gutter passa a precisar de um lugar so.
 */
export function Container<T extends ElementType = 'div'>({ as, className, ...rest }: ContainerProps<T>) {
  const Component = (as ?? 'div') as ElementType;
  return <Component className={cn(containerClasses, className)} {...rest} />;
}
