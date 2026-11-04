"use client";
// Client Component: estado da aba ativa, foco por setas (roving tabindex) e refs
// das abas. Os paineis inativos ficam no HTML com `hidden` (conteudo indexavel).

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../cn';

export type TabItem = { id: string; label: string; content: ReactNode };

export type TabsProps = {
  tabs: TabItem[];
  defaultId?: string;
  /** Nome acessivel do tablist. Obrigatorio. */
  label: string;
  onChange?: (id: string) => void;
  className?: string;
};

/**
 * Abas (padrao WAI-ARIA): setas esquerda/direita movem e ativam, Home/End vao
 * ao primeiro/ultimo; so a aba ativa entra na ordem de Tab (roving tabindex).
 */
export function Tabs({ tabs, defaultId, label, onChange, className }: TabsProps) {
  const base = useId();
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
    refs.current[id]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    const target = tabs[next];
    if (target) select(target.id);
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'min-h-11 shrink-0 border-b-2 px-4 text-md',
                selected ? 'border-on-surface font-bold text-on-surface' : 'border-transparent text-on-surface-muted',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
