import type { ReactNode } from 'react';
import { cn } from '../cn';

export type AccordionItem = {
  id: string;
  /** Titulo do painel (vira o <summary>). */
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** Nivel do titulo no contexto da pagina (nao pula nivel de heading). */
  headingLevel?: 2 | 3 | 4;
  /** Com `name`, o navegador fecha os outros itens ao abrir um (exclusivo). */
  name?: string;
  className?: string;
};

/**
 * Accordion nativo (`<details>/<summary>`): Server Component, zero JS, conteudo
 * sempre no HTML inicial (indexavel) e teclado/leitor de tela gratis.
 */
export function Accordion({ items, headingLevel = 3, name, className }: AccordionProps) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={cn('divide-y divide-border border-y border-border', className)}>
      {items.map((item) => (
        <details key={item.id} name={name} open={item.defaultOpen} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
            <H className="text-md font-medium">{item.title}</H>
            <span
              aria-hidden="true"
              className="text-xl leading-none transition-transform duration-(--nears-duration-fast) group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="pb-4 text-on-surface-muted">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
