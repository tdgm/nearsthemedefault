import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import { controlClasses, describedBy, fieldIds, FieldMessages } from '../field/field';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  /** Rotulo visivel. Obrigatorio: todo campo tem label (CLAUDE.md > Acessibilidade). */
  label: string;
  hint?: ReactNode;
  /** Mensagem de erro. Presente = campo invalido (aria-invalid). */
  error?: ReactNode;
  id?: string;
  /** Marca como obrigatorio com texto "(obrigatorio)" para quem nao ve o asterisco. */
  required?: boolean;
};

export function Input({ label, hint, error, id, required, className, ...rest }: InputProps) {
  const generated = useId();
  const ids = fieldIds(id ?? generated);
  return (
    <div className="grid gap-1">
      <label htmlFor={ids.id} className="text-sm font-medium">
        {label}
        {required && <span className="text-on-surface-muted"> (obrigatório)</span>}
      </label>
      <input
        id={ids.id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        className={cn(controlClasses, className)}
        {...rest}
      />
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
