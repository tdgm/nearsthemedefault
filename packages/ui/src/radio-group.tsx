'use client';

// Radix e permitido aqui: "radiogroup" esta na lista fechada de primitivas
// do CLAUDE.md > Stack. Teclado (setas, home/end) e role=radiogroup vem de
// graca; sem Radix teriamos que reimplementar o WAI-ARIA Radio Group pattern.
import type { ReactNode } from 'react';
import * as Radix from '@radix-ui/react-radio-group';
import { cx } from './cx';

export type RadioGroupProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  children: ReactNode;
  className?: string;
};

export function RadioGroup({ label, children, className, ...props }: RadioGroupProps) {
  return (
    <Radix.Root aria-label={label} className={cx('flex flex-col gap-2', className)} {...props}>
      {children}
    </Radix.Root>
  );
}

export type RadioGroupItemProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function RadioGroupItem({ value, children, disabled, className }: RadioGroupItemProps) {
  return (
    <label className={cx('inline-flex min-h-11 cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-50', className)}>
      <Radix.Item
        value={value}
        disabled={disabled}
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border-control data-[state=checked]:border-action"
      >
        <Radix.Indicator className="size-2.5 rounded-full bg-action" />
      </Radix.Item>
      <span className="text-md text-on-surface">{children}</span>
    </label>
  );
}
