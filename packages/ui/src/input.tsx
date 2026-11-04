import { useId, type InputHTMLAttributes } from 'react';
import { cx } from './cx';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  /** Mensagem de erro. Quando presente, liga aria-invalid + aria-describedby. */
  error?: string;
  hint?: string;
  id?: string;
};

/** Campo de texto com label, dica e erro associados via aria-describedby. Alvo de toque 44px. */
export function Input({ label, error, hint, id, className, required, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          'min-h-11 rounded-md border bg-surface px-3 text-md text-on-surface placeholder:text-on-surface-faint',
          error ? 'border-danger' : 'border-border-control',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-on-surface-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
