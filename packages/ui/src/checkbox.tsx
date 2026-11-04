import { useId, type InputHTMLAttributes } from 'react';
import { cx } from './cx';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string;
  id?: string;
};

/** Checkbox nativo com area de toque de 44x44 (o quadrado visual e menor, a label expande o alvo). */
export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  return (
    <label htmlFor={checkboxId} className="inline-flex min-h-11 cursor-pointer items-center gap-2 py-2">
      <input
        id={checkboxId}
        type="checkbox"
        className={cx('size-5 rounded-sm border border-border-control text-action accent-action', className)}
        {...props}
      />
      <span className="text-md text-on-surface">{label}</span>
    </label>
  );
}
