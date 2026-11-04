import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Em vez de ocupar 100% do container, usa um aspect-ratio (CLAUDE.md: toda imagem/placeholder reserva espaco). */
  aspectRatio?: string;
};

/** Placeholder de carregamento. Reduced-motion congela o shimmer (regra global). */
export function Skeleton({ aspectRatio, className, style, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={aspectRatio ? { aspectRatio, ...style } : style}
      className={cx('animate-pulse rounded-md bg-surface-subtle', className)}
      {...props}
    />
  );
}
