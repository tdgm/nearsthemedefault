import type { ReactNode } from 'react';

type FoundationsNoteProps = {
  title: string;
  children: ReactNode;
};

/**
 * Componente provisorio da Fase 0: existe so para provar a cadeia
 * Storybook -> axe (test:a11y) -> Vitest. Sera removido quando a Fase 3
 * entregar os componentes reais (docs/adr/0009-fase-0-fundacao.md).
 */
export function FoundationsNote({ title, children }: FoundationsNoteProps) {
  return (
    <section aria-labelledby="foundations-note-title">
      <h2 id="foundations-note-title">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
