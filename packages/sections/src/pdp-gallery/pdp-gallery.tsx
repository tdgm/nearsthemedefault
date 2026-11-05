import { Image, Overlay, OverlayTrigger, cn } from '@nears/ui';
import { fill } from '../shared/template.ts';
import type { PdpGalleryProps } from './pdp-gallery.schema';

const defaults = {
  gallery: 'Fotos do produto',
  thumbs: 'Miniaturas',
  image: 'Ver foto {n} de {total}',
  zoom: 'Ampliar foto {n} de {total}',
  video: 'Vídeo do produto',
} as const;

const SIZES = '(min-width: 1024px) 50vw, 100vw';
const ZOOM_SIZES = '(min-width: 1024px) 1024px, 100vw';

/**
 * Galeria da PDP, 100% navegavel sem JS: os slides sao uma faixa com scroll-snap
 * nativo (gesto de arrastar no mobile) e as miniaturas sao ancoras (`#pdp-img-N`).
 * A 1a foto e a candidata a LCP: eager + fetchpriority alto; as demais, lazy.
 * O zoom e um `<dialog>` nativo por foto (Esc e focus trap do navegador), aberto
 * por uma ilha minima (OverlayTrigger) que ja existe no bundle do header; a
 * imagem ampliada e lazy, entao so baixa quando o dialogo abre.
 */
export function PdpGallery({ images, zoom = true, video, thumbs = 'vertical', aspect = 'portrait', labels }: PdpGalleryProps) {
  const l = { ...defaults, ...labels };
  const total = images.length;
  const ratio = { aspectRatio: `var(--nears-aspect-${aspect})` };
  return (
    <section
      aria-label={l.gallery}
      className={cn('grid gap-3 py-4', thumbs === 'vertical' && images.length > 1 && 'md:grid-cols-[4.5rem_minmax(0,1fr)]')}
    >
      <ul
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto md:order-2 [&::-webkit-scrollbar]:hidden"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        {images.map((img, i) => (
          <li key={img.src} id={`pdp-img-${i + 1}`} className="relative w-full shrink-0 snap-center overflow-hidden rounded-md bg-surface-subtle" style={ratio}>
            <Image
              src={img.src}
              width={img.width}
              height={img.height}
              alt={img.alt}
              sizes={SIZES}
              priority={i === 0}
              className="size-full object-cover"
            />
            {zoom && (
              <OverlayTrigger
                targetId={`pdp-zoom-${i + 1}`}
                aria-label={fill(l.zoom, { n: i + 1, total })}
                className="absolute inset-0 cursor-zoom-in"
              >
                <span className="sr-only">{fill(l.zoom, { n: i + 1, total })}</span>
              </OverlayTrigger>
            )}
          </li>
        ))}
        {video && (
          <li className="w-full shrink-0 snap-center overflow-hidden rounded-md bg-surface-subtle" style={ratio}>
            <video controls preload="none" playsInline aria-label={l.video} src={video} className="size-full object-cover" />
          </li>
        )}
      </ul>

      {total > 1 && (
        <nav aria-label={l.thumbs} className="md:order-1">
          <ol className={cn('flex gap-2', thumbs === 'vertical' ? 'overflow-x-auto md:flex-col md:overflow-visible' : 'justify-center')}>
            {images.map((img, i) => (
              <li key={img.src} className="shrink-0">
                <a href={`#pdp-img-${i + 1}`} aria-label={fill(l.image, { n: i + 1, total })} className="inline-flex size-11 items-center justify-center md:size-[4.5rem]">
                  {thumbs === 'vertical' ? (
                    <Image src={img.src} width={img.width} height={img.height} alt="" sizes="72px" className="size-full rounded-md border border-border object-cover" />
                  ) : (
                    <span aria-hidden="true" className="size-2.5 rounded-full bg-on-surface-faint" />
                  )}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {zoom &&
        images.map((img, i) => (
          <Overlay key={img.src} id={`pdp-zoom-${i + 1}`} side="center" title={fill(l.zoom, { n: i + 1, total })}>
            <Image src={img.src} width={img.width} height={img.height} alt={img.alt} sizes={ZOOM_SIZES} className="h-auto w-full" />
          </Overlay>
        ))}
    </section>
  );
}
