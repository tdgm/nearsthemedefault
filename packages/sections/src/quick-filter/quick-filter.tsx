import { cn } from '@nears/ui';
import { chipHref } from './chip-href.ts';
import type { QuickFilterProps } from './quick-filter.schema';

/**
 * Chips de filtro rapido como links reais (`seo.linksInHtml`): funcionam sem JS
 * e o navegador faz GET normal. Faixa com scroll-snap nativo, altura reservada
 * de 48px, alvo de 44px. Chip ativo: `aria-current="true"` (alem da cor). Combinar
 * facetas gera `rel="nofollow"` (ver `chipHref`).
 */
export function QuickFilter({ chips, basePath = '', current = {}, labels }: QuickFilterProps) {
  return (
    <nav aria-label={labels?.region ?? 'Filtros rápidos'} className="mx-auto min-h-12 max-w-7xl px-4 py-2">
      <ul
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- faixa rolavel precisa de foco para rolagem por teclado (axe: scrollable-region-focusable).
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {chips.map((chip) => {
          const { href, active, nofollow } = chipHref(basePath, current, chip);
          return (
            <li key={`${chip.facet}:${chip.value}`} className="shrink-0 snap-start">
              <a
                href={href}
                rel={nofollow ? 'nofollow' : undefined}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm',
                  active ? 'border-action bg-action text-action-on' : 'border-border-control hover:bg-surface-subtle',
                )}
              >
                {chip.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
