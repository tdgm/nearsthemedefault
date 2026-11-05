import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  shape?: 'text' | 'rect' | 'circle';
  /** Anuncia o carregamento a leitores de tela (role=status). Use em um bloco por area, nao em cada linha. */
  label?: string;
};

/**
 * Placeholder de carregamento. Defina largura e altura (classes) ou aspect-ratio
 * para reservar o espaco final e nao gerar CLS (CLAUDE.md > Performance).
 */
export function Skeleton({ shape = 'rect', label, className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden={label ? undefined : true}
      role={label ? 'status' : undefined}
      className={cn(
        'animate-pulse bg-surface-raised',
        shape === 'text' && 'h-4 w-full rounded-sm',
        shape === 'rect' && 'rounded-md',
        shape === 'circle' && 'rounded-full',
        className,
      )}
      {...rest}
    >
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
