import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import { describedBy, fieldIds, FieldMessages } from '../field/field';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
};

/**
 * Checkbox nativo. O alvo de toque de 44px e o `<label>` inteiro (linha clicavel),
 * nao so a caixa de 20px.
 */
export function Checkbox({ label, hint, error, id, className, ...rest }: CheckboxProps) {
  const generated = useId();
  const ids = fieldIds(id ?? generated);
  return (
    <div className="grid gap-1">
      <label htmlFor={ids.id} className={cn('flex min-h-11 cursor-pointer items-center gap-3', className)}>
        <input
          id={ids.id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { hint, error })}
          className="size-5 shrink-0 accent-action disabled:cursor-not-allowed"
          {...rest}
        />
        <span>{label}</span>
      </label>
      <FieldMessages ids={ids} hint={hint} error={error} className="ml-8" />
    </div>
  );
}
