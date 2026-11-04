'use client';

// WAI-ARIA Tabs pattern implementado a mao: "tabs" nao esta na lista de
// primitivas Radix permitidas (CLAUDE.md > Stack: so overlay/menu/dialog/
// radiogroup). Modelo de ativacao automatica (seta move o foco E seleciona).
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './cx';

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

export type TabsProps = {
  items: TabItem[];
  defaultTabId?: string;
  /** Rotulo do conjunto de abas, para leitor de tela (ex.: "Detalhes do produto"). */
  label: string;
};

export function Tabs({ items, defaultTabId, label }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusAndSelect(index: number) {
    const target = items[(index + items.length) % items.length];
    if (!target) return;
    setActiveId(target.id);
    tabRefs.current[target.id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') focusAndSelect(index + 1);
    else if (event.key === 'ArrowLeft') focusAndSelect(index - 1);
    else if (event.key === 'Home') focusAndSelect(0);
    else if (event.key === 'End') focusAndSelect(items.length - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-border">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cx(
                'min-h-11 border-b-2 px-4 text-md font-medium',
                selected ? 'border-action text-on-surface' : 'border-transparent text-on-surface-muted',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== activeId}
          className="py-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
