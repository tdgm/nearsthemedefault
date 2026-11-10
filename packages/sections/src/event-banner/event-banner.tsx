import { ArtImage } from '../shared/art-image.tsx';
import { illustrationFilter } from '../shared/illustration.ts';
import type { EventBannerProps } from './event-banner.schema';

/**
 * Faixa de campanha full-width com art direction: `<picture>` troca a arte em
 * 768px. Largura/altura vao no `<source>` e no `<img>`, entao o navegador reserva
 * o espaco certo nos dois formatos (CLS 0). Abaixo da dobra: lazy + async.
 * Formatos AVIF/WebP entram quando o loader de CDN existir (Fase 6).
 *
 * `alt` tambem serve de semente pro filtro de matiz (docs/adr/0032): quando a
 * mesma arte-placeholder do Hero e reusada aqui, ela nao fica identica - o Hero
 * fica com a arte original e este banner ganha uma variacao.
 */
export function EventBanner({ imageDesktop, imageMobile, alt, href }: EventBannerProps) {
  const picture = <ArtImage desktop={imageDesktop} mobile={imageMobile} alt={alt} style={{ filter: illustrationFilter(alt) }} />;
  return (
    <section className="mb-20 [contain-intrinsic-size:auto_240px] [content-visibility:auto]">
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
