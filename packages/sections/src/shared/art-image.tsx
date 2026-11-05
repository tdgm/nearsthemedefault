export type ArtSource = { src: string; width: number; height: number };

/**
 * `<picture>` com art direction: `desktop` a partir de 768px, `mobile` abaixo.
 * Largura/altura vao no `<source>` e no `<img>`, entao o navegador reserva o
 * espaco certo nos dois formatos (CLS 0). `priority` = candidata a LCP: eager +
 * `fetchpriority="high"`; senao lazy + `decoding="async"` (CLAUDE.md > Performance).
 * AVIF/WebP entram com o loader de CDN (Fase 6).
 */
export function ArtImage({
  desktop,
  mobile,
  alt,
  priority = false,
  className,
}: {
  desktop: ArtSource;
  mobile: ArtSource;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <picture>
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
      />
    </picture>
  );
}
