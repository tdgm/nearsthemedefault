import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../cn';
import { controlClasses, describedBy, fieldIds, FieldMessages } from '../field/field';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & {
  label: string;
  options: SelectOption[];
  /** Texto da primeira opcao vazia (ex.: "Selecione"). Omitido = sem opcao vazia. */
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
};

/** `<select>` nativo: teclado, leitor de tela e picker mobile de graca (zero JS). */
export function Select({ label, options, placeholder, hint, error, id, className, ...rest }: SelectProps) {
  const generated = useId();
  const ids = fieldIds(id ?? generated);
  return (
    <div className="grid gap-1">
      <label htmlFor={ids.id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        className={cn(controlClasses, className)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
