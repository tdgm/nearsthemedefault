import { useId, type SelectHTMLAttributes } from 'react';
import { cx } from './cx';

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  id?: string;
};

/**
 * `<select>` nativo estilizado (sem lib de combobox - CLAUDE.md > Radix so
 * cobre overlay/menu/dialog/radiogroup). Semantica e teclado ja sao nativos.
 */
export function Select({ label, options, error, hint, id, className, required, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-on-surface">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          'min-h-11 rounded-md border bg-surface px-3 text-md text-on-surface',
          error ? 'border-danger' : 'border-border-control',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
