import { Carousel, buttonClasses } from '@nears/ui';
import { ArtImage } from '../shared/art-image.tsx';
import type { HeroProps } from './hero.schema';

type Slide = HeroProps['slides'][number];

/**
 * Slide: arte com art direction (desktop/mobile) e, se houver, legenda em faixa
 * de superficie solida abaixo da imagem - o texto nunca fica sobre a foto, entao
 * o contraste vem dos tokens. So o primeiro slide e candidato a LCP (eager +
 * fetchpriority alto); os demais sao lazy. Titulo e `<p>`: o H1 e do template.
 */
function HeroSlide({ slide, first }: { slide: Slide; first: boolean }) {
  const art = <ArtImage desktop={slide.imageDesktop} mobile={slide.imageMobile} alt={slide.alt} priority={first} />;
  return (
    <div>
      {slide.href ? (
        <a href={slide.href} className="block">
          {art}
        </a>
      ) : (
        art
      )}
      {(slide.headline || (slide.cta && slide.href)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-subtle px-4 py-3">
          {slide.headline && <p className="text-lg font-bold text-balance">{slide.headline}</p>}
          {slide.cta && slide.href && (
            <a href={slide.href} className={buttonClasses({ variant: 'primary', size: 'md' })}>
              {slide.cta}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hero: banner principal da home. Server Component; um unico slide nao carrega
 * JS nenhum. Com varios, usa o `Carousel` do design system (scroll-snap nativo +
 * botoes; as imagens ja estao no HTML). `autoplay` liga a rotacao com botao de
 * pausa, pausa com hover/foco e nao inicia com prefers-reduced-motion.
 * Prioridade `critical`: 1o slide e o LCP da home (meta de 2.0s no mobile).
 */
export function Hero({ slides, autoplay = false, intervalMs = 6000, labels }: HeroProps) {
  const region = labels?.region ?? 'Destaques';
  if (slides.length === 1) {
    return (
      <section aria-label={region}>
        <HeroSlide slide={slides[0]!} first />
      </section>
    );
  }
  return (
    <Carousel
      label={region}
      autoplayMs={autoplay ? intervalMs : undefined}
      slides={slides.map((slide, i) => (
        <HeroSlide key={`${slide.alt}-${i}`} slide={slide} first={i === 0} />
      ))}
    />
  );
}
