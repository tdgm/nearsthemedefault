import { Carousel, Container, buttonClasses } from '@nears/ui';
import { ArtImage } from '../shared/art-image.tsx';
import type { HeroProps } from './hero.schema';

type Slide = HeroProps['slides'][number];

/**
 * Slide (V1 Nears, ADR 0038): arte com art direction (desktop/mobile) e, se houver,
 * painel de marca ao lado (lg:) ou abaixo (mobile) com titulo e CTA - o texto nunca
 * fica sobre a foto, entao o contraste vem dos tokens (`surface-brand`/`on-brand`). So o primeiro slide e candidato a LCP (eager +
 * fetchpriority alto); os demais sao lazy. Titulo e `<p>`: o H1 e do template.
 */
function HeroSlide({ slide, first }: { slide: Slide; first: boolean }) {
  const art = <ArtImage desktop={slide.imageDesktop} mobile={slide.imageMobile} alt={slide.alt} priority={first} />;
  const hasPanel = Boolean(slide.headline || (slide.cta && slide.href));
  return (
    <Container>
      <div className={hasPanel ? 'grid gap-4 lg:grid-cols-[5fr_6fr]' : undefined}>
        <div className="overflow-hidden rounded-2xl lg:order-2">
          {slide.href ? (
            <a href={slide.href} className="block">
              {art}
            </a>
          ) : (
            art
          )}
        </div>
        {hasPanel && (
          <div className="flex flex-col justify-between gap-8 rounded-2xl bg-surface-brand p-6 text-on-brand md:p-10 lg:order-1">
            {slide.headline && <p className="text-4xl font-heading tracking-tight text-balance md:text-5xl">{slide.headline}</p>}
            {slide.cta && slide.href && (
              <a href={slide.href} className={`${buttonClasses({ variant: 'primary', size: 'lg' })} self-start`}>
                {slide.cta}
              </a>
            )}
          </div>
        )}
      </div>
    </Container>
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
      <section aria-label={region} className="mb-20">
        <HeroSlide slide={slides[0]!} first />
      </section>
    );
  }
  return (
    <Carousel
      label={region}
      className="mb-20"
      autoplayMs={autoplay ? intervalMs : undefined}
      slides={slides.map((slide, i) => (
        <HeroSlide key={`${slide.alt}-${i}`} slide={slide} first={i === 0} />
      ))}
    />
  );
}
