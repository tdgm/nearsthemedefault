import { Image, formatBRL } from '@nears/ui';
import type { CategoryHubProps } from './category-hub.schema';

const defaults = { region: 'Compre por categoria', fromPrice: 'a partir de' } as const;

/**
 * "Compre por categoria": ate `limit` cards (padrao 6) numa lista real de links
 * no HTML inicial (`seo.linksInHtml`). Mobile: faixa com scroll-snap nativo
 * (focavel, rolavel por teclado); desktop: grade de 6 colunas. Imagem com
 * dimensoes e lazy; preco "a partir de" formatado em /lib/format (BR).
 */
export function CategoryHub({ items, limit = 6, labels }: CategoryHubProps) {
  const l = { ...defaults, ...labels };
  return (
    <section aria-label={l.region} className="mx-auto max-w-7xl px-4 py-4 [contain-intrinsic-size:auto_280px] [content-visibility:auto]">
      <ul
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- faixa rolavel precisa de foco para rolagem por teclado (axe: scrollable-region-focusable).
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6 [&::-webkit-scrollbar]:hidden"
      >
        {items.slice(0, limit).map((item) => (
          <li key={item.href} className="w-36 shrink-0 snap-start md:w-auto">
            <a href={item.href} className="group flex min-h-11 flex-col gap-2">
              <Image
                src={item.image.src}
                alt=""
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 144px"
                className="h-auto w-full rounded-md"
              />
              <span className="font-medium underline-offset-4 group-hover:underline">{item.label}</span>
              {item.fromPrice !== undefined && (
                <span className="text-sm text-on-surface-muted">
                  {l.fromPrice} {formatBRL(item.fromPrice)}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
