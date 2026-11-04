import type { ReactNode } from 'react';
import { cn } from '../cn';

/** Ids ligando rotulo, dica e erro ao controle (aria-describedby / aria-errormessage). */
export type FieldIds = { id: string; hintId: string; errorId: string };

export const fieldIds = (id: string): FieldIds => ({ id, hintId: `${id}-hint`, errorId: `${id}-error` });

/** Valor de aria-describedby com so os ids presentes. */
export const describedBy = (ids: FieldIds, { hint, error }: { hint?: ReactNode; error?: ReactNode }): string | undefined =>
  [hint ? ids.hintId : null, error ? ids.errorId : null].filter(Boolean).join(' ') || undefined;

type FieldMessagesProps = { ids: FieldIds; hint?: ReactNode; error?: ReactNode; className?: string };

/**
 * Dica e erro de um campo. O erro tem role=alert para ser anunciado ao aparecer
 * (e nao so quando o foco chega), sem depender so de cor (usa texto + icone).
 */
export function FieldMessages({ ids, hint, error, className }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <p id={ids.hintId} className={cn('text-sm text-on-surface-muted', className)}>
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} role="alert" className={cn('flex gap-1 text-sm font-medium text-danger', className)}>
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </>
  );
}

/** Estilo comum de controles de texto (Input, Select). Alvo minimo de 44px. */
export const controlClasses =
  'min-h-11 w-full rounded-md border border-border-control bg-surface px-3 text-md text-on-surface ' +
  'placeholder:text-on-surface-faint disabled:cursor-not-allowed disabled:opacity-50 ' +
  'aria-invalid:border-danger aria-invalid:border-2';
