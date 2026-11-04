'use client';

// "Seletor de variacao (cor, tamanho, voltagem, peso...) e radiogroup, nao
// lista de botoes" (CLAUDE.md > Acessibilidade). Radix RadioGroup da o
// role=radiogroup e a navegacao por setas de graca.
import * as Radix from '@radix-ui/react-radio-group';
import { cx } from './cx';

export type VariantOption = {
  value: string;
  label: string;
  /** Cor CSS para o swatch (so usada quando display="swatch"). */
  swatchColor?: string;
  disabled?: boolean;
};

export type VariantSelectorProps = {
  /** Nome do eixo (ex.: "Cor", "Tamanho") - vira o aria-label do grupo. */
  label: string;
  options: VariantOption[];
  display: 'swatch' | 'option';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
};

export function VariantSelector({ label, options, display, ...props }: VariantSelectorProps) {
  return (
    <Radix.Root aria-label={label} className="flex flex-wrap gap-2" {...props}>
      {options.map((option) =>
        display === 'swatch' ? (
          <Radix.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-label={option.label}
            title={option.label}
            style={{ backgroundColor: option.swatchColor }}
            className={cx(
              'flex size-11 items-center justify-center rounded-full border-2 border-border',
              'data-[state=checked]:border-action data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
            )}
          >
            <Radix.Indicator className="size-3 rounded-full border-2 border-action-on" />
          </Radix.Item>
        ) : (
          <Radix.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={cx(
              'min-h-11 min-w-11 rounded-md border border-border-control px-3 text-md text-on-surface',
              'data-[state=checked]:border-action data-[state=checked]:bg-surface-subtle data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
            )}
          >
            {option.label}
          </Radix.Item>
        ),
      )}
    </Radix.Root>
  );
}
