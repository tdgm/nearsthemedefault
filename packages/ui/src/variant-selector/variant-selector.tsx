"use client";
// Client Component: guarda a opcao escolhida para mostrar "Cor: Azul" e anunciar
// a mudanca (aria-live) sem esperar o servidor.
import { useId, useState } from 'react';
import { cn } from '../cn';
import { FieldMessages, fieldIds } from '../field/field';

export type VariantOption = {
  value: string;
  label: string;
  /** Cor da amostra (so no display `swatch`): dado do produto, ex.: "#1b4d89". */
  swatch?: string;
  /** Sem estoque nessa combinacao: continua visivel, mas nao selecionavel. */
  unavailable?: boolean;
};

export type VariantSelectorProps = {
  /** Nome do eixo (catalog.variantAxes[].label): "Cor", "Tamanho", "Voltagem"... */
  legend: string;
  /** `swatch` = amostra visual; `option` = texto. Os dois sao radiogroup (CLAUDE.md). */
  display: 'swatch' | 'option';
  options: VariantOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  unavailableLabel?: string;
};

/**
 * Seletor de variacao do SKU. E um `radiogroup` (setas navegam, Tab entra uma
 * vez no grupo), nao uma lista de botoes. Alvo de toque de 44x44px por opcao.
 */
export function VariantSelector({
  legend,
  display,
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  error,
  unavailableLabel = 'indisponível',
}: VariantSelectorProps) {
  const generated = useId();
  const groupName = name ?? generated;
  const ids = fieldIds(groupName);
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? ids.errorId : undefined}
      className="grid gap-2 border-0 p-0"
    >
      <legend className="mb-1 text-sm font-medium">
        {legend}
        {/* Regiao viva: anuncia a escolha sem mover o foco. */}
        <span aria-live="polite" className="font-normal text-on-surface-muted">
          {selectedLabel ? `: ${selectedLabel}` : ''}
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const id = `${groupName}-${o.value}`;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={cn('relative inline-flex', o.unavailable ? 'cursor-not-allowed' : 'cursor-pointer')}
            >
              <input
                id={id}
                type="radio"
                name={groupName}
                value={o.value}
                disabled={o.unavailable}
                checked={value !== undefined ? value === o.value : undefined}
                defaultChecked={value === undefined && defaultValue !== undefined ? defaultValue === o.value : undefined}
                onChange={() => {
                  setInner(o.value);
                  onValueChange?.(o.value);
                }}
                className="peer sr-only"
              />
              {display === 'swatch' ? (
                <span
                  className={cn(
                    'grid size-11 place-items-center rounded-full border-2 border-transparent',
                    'peer-checked:border-on-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                    'peer-focus-visible:outline-focus-ring peer-disabled:opacity-40',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-8 rounded-full border border-border-control"
                    style={{ backgroundColor: o.swatch }}
                  />
                  <span className="sr-only">
                    {o.label}
                    {o.unavailable ? ` (${unavailableLabel})` : ''}
                  </span>
                </span>
              ) : (
                <span
                  className={cn(
                    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border-control px-3 text-md',
                    'peer-checked:border-2 peer-checked:border-on-surface peer-checked:font-bold',
                    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring',
                    'peer-disabled:text-on-surface-muted peer-disabled:line-through peer-disabled:opacity-60',
                  )}
                >
                  {o.label}
                  {o.unavailable && <span className="sr-only"> ({unavailableLabel})</span>}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <FieldMessages ids={ids} error={error} />
    </fieldset>
  );
}
