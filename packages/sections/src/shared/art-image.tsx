import type { CSSProperties } from 'react';

export type ArtSource = { src: string; width: number; height: number; avif?: string; webp?: string };

/** `<source>` por formato moderno de uma arte, na ordem de preferencia (AVIF, WebP). */
function formatSources(media: string, art: ArtSource) {
  return (
    [
      ['image/avif', art.avif],
      ['image/webp', art.webp],
    ] as const
  ).flatMap(([type, srcSet]) =>
    srcSet ? [<source key={`${media}-${type}`} media={media} type={type} srcSet={srcSet} width={art.width} height={art.height} />] : [],
  );
}

/**
 * `<picture>` com art direction: `desktop` a partir de 768px, `mobile` abaixo.
 * Largura/altura vao no `<source>` e no `<img>`, entao o navegador reserva o
 * espaco certo nos dois formatos (CLS 0). `priority` = candidata a LCP: eager +
 * `fetchpriority="high"`; senao lazy + `decoding="async"` (CLAUDE.md > Performance).
 * Quando a arte traz `avif`/`webp`, cada breakpoint ganha um `<source>` por formato
 * (AVIF primeiro) e `src` fica como fallback.
 */
export function ArtImage({
  desktop,
  mobile,
  alt,
  priority = false,
  className,
  style,
}: {
  desktop: ArtSource;
  mobile: ArtSource;
  alt: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <picture>
      {formatSources('(min-width: 768px)', desktop)}
      {formatSources('(max-width: 767px)', mobile)}
      <source media="(min-width: 768px)" srcSet={desktop.src} width={desktop.width} height={desktop.height} />
      <img
        src={mobile.src}
        alt={alt}
        width={mobile.width}
        height={mobile.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className ?? 'block h-auto w-full'}
        style={style}
      />
    </picture>
  );
}
