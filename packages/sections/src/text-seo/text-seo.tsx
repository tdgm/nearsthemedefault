import type { CSSProperties } from 'react';
import { toParagraphs } from '../shared/paragraphs.ts';
import type { TextSeoProps } from './text-seo.schema';

const defaults = { more: 'Ler mais', less: 'Ler menos' } as const;

/**
 * Bloco de texto SEO/GEO. O primeiro paragrafo (a resposta direta) fica sempre
 * visivel; o restante vai num `<details>` nativo (zero JS) e esta sempre no HTML
 * inicial. Onde ha suporte a `::details-content`, o trecho recolhido mostra
 * `collapsedHeight` px do restante; sem suporte, o restante abre ao expandir.
 * `content-visibility: auto` com tamanho intrinseco declarado (CLAUDE.md).
 */
export function TextSeo({ title, richText, collapsible = true, collapsedHeight = 160, labels }: TextSeoProps) {
  const l = { ...defaults, ...labels };
  const [lead = '', ...rest] = toParagraphs(richText);
  const paragraph = 'mb-3 text-on-surface-muted';
  return (
    <section className="mx-auto mb-10 max-w-4xl px-4 [contain-intrinsic-size:auto_320px] [content-visibility:auto]">
      {title && <h2 className="mb-3 text-xl font-heading text-balance">{title}</h2>}
      <p className={paragraph}>{lead}</p>
      {rest.length > 0 &&
        (collapsible ? (
          <details
            className="group [&:not([open])::details-content]:[block-size:var(--nears-collapsed)] [&:not([open])::details-content]:overflow-hidden [&::details-content]:[content-visibility:visible]"
            style={{ '--nears-collapsed': `${collapsedHeight}px` } as CSSProperties}
          >
            <summary className="mb-3 inline-flex min-h-11 cursor-pointer list-none items-center font-medium underline underline-offset-4 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{l.more}</span>
              <span className="hidden group-open:inline">{l.less}</span>
            </summary>
            {rest.map((p, i) => (
              <p key={i} className={paragraph}>
                {p}
              </p>
            ))}
          </details>
        ) : (
          rest.map((p, i) => (
            <p key={i} className={paragraph}>
              {p}
            </p>
          ))
        ))}
    </section>
  );
}
