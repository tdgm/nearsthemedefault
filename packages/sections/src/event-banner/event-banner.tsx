import type { EventBannerProps } from './event-banner.schema';

/**
 * Faixa de campanha full-width com art direction: `<picture>` troca a arte em
 * 768px. Largura/altura vao no `<source>` e no `<img>`, entao o navegador reserva
 * o espaco certo nos dois formatos (CLS 0). Abaixo da dobra: lazy + async.
 * Formatos AVIF/WebP entram quando o loader de CDN existir (Fase 6).
 */
export function EventBanner({ imageDesktop, imageMobile, alt, href }: EventBannerProps) {
  const picture = (
    <picture>
      <source media="(min-width: 768px)" srcSet={imageDesktop.src} width={imageDesktop.width} height={imageDesktop.height} />
      <img
        src={imageMobile.src}
        alt={alt}
        width={imageMobile.width}
        height={imageMobile.height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </picture>
  );
  return (
    <section className="[contain-intrinsic-size:auto_240px] [content-visibility:auto]">
      {href ? (
        <a href={href} className="block">
          {picture}
        </a>
      ) : (
        picture
      )}
    </section>
  );
}
