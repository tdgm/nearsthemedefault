"use client";
// Client Component: usa createContext/useContext para compartilhar name/value entre
// RadioGroup e Radio (Server Components nao suportam contexto).

import { createContext, useContext, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import { FieldMessages, fieldIds } from '../field/field';

type RadioGroupContext = {
  name: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  disabled?: boolean | undefined;
};
const GroupContext = createContext<RadioGroupContext | null>(null);

export type RadioGroupProps = {
  /** Rotulo do grupo (vira <legend>). Obrigatorio. */
  legend: string;
  name?: string;
  /** Controlado. */
  value?: string;
  /** Nao controlado. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
  className?: string;
};

/**
 * Grupo de radios: `<fieldset role="radiogroup">` + `<legend>`. Radios nativos
 * com o mesmo `name` ja dao setas, Tab unico no grupo e selecao ao focar, sem
 * JS de roving tabindex (docs/adr/0013). Usado tambem pelo VariantSelector.
 */
export function RadioGroup({
  legend,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  hint,
  error,
  orientation = 'vertical',
  children,
  className,
}: RadioGroupProps) {
  const generated = useId();
  const groupName = name ?? generated;
  const ids = fieldIds(groupName);
  const ctx: RadioGroupContext = { name: groupName, value, defaultValue, onChange: onValueChange, disabled };
  return (
    <fieldset
      role="radiogroup"
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={[hint ? ids.hintId : null, error ? ids.errorId : null].filter(Boolean).join(' ') || undefined}
      className={cn('grid gap-1 border-0 p-0', className)}
    >
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <GroupContext.Provider value={ctx}>
        <div className={cn('flex gap-1', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap gap-x-4')}>
          {children}
        </div>
      </GroupContext.Provider>
      <FieldMessages ids={ids} hint={hint} error={error} />
    </fieldset>
  );
}

export const useRadioGroup = () => useContext(GroupContext);

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & {
  label: ReactNode;
  value: string;
  id?: string;
};

/** Radio nativo; alvo de 44px = linha inteira (label). */
export function Radio({ label, value, id, className, onChange, ...rest }: RadioProps) {
  const generated = useId();
  const group = useRadioGroup();
  const inputId = id ?? generated;
  const checkedProps =
    group?.value !== undefined
      ? { checked: group.value === value }
      : group?.defaultValue !== undefined
        ? { defaultChecked: group.defaultValue === value }
        : {};
  return (
    <label htmlFor={inputId} className={cn('flex min-h-11 cursor-pointer items-center gap-3', className)}>
      <input
        {...rest}
        id={inputId}
        type="radio"
        name={group?.name ?? rest.name}
        value={value}
        disabled={group?.disabled || rest.disabled}
        {...checkedProps}
        onChange={(e) => {
          group?.onChange?.(value);
          onChange?.(e);
        }}
        className="size-5 shrink-0 accent-action disabled:cursor-not-allowed"
      />
      <span>{label}</span>
    </label>
  );
}
