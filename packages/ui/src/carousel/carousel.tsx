"use client";
// Client Component: botoes anterior/proximo usam refs + scrollIntoView, e o scroll
// do usuario (gesto/teclado) sincroniza o indice. A rolagem em si e CSS nativo
// (scroll-snap): sem JS o carrossel continua navegavel por gesto e teclado.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '../cn';

export type CarouselProps = {
  slides: ReactNode[];
  /** Nome acessivel do carrossel (vira aria-label da regiao). Obrigatorio. */
  label: string;
  /** Slides visiveis por vez em telas largas (mobile mostra ~1,2 para sugerir rolagem). */
  perView?: 1 | 2 | 3 | 4;
  labels?: { previous: string; next: string; slide: (n: number, total: number) => string; pause?: string; play?: string };
  /** Avanca sozinho a cada N ms (volta ao primeiro no fim). Desligado por padrao; ver `pause`. */
  autoplayMs?: number;
  className?: string;
};

const defaultLabels = {
  previous: 'Slide anterior',
  next: 'Próximo slide',
  slide: (n: number, total: number) => `${n} de ${total}`,
  pause: 'Pausar rotação',
  play: 'Retomar rotação',
};

const REDUCED = '(prefers-reduced-motion: reduce)';
const prefersReducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED).matches);
const subscribeReducedMotion = (onChange: () => void) => {
  const query = typeof window !== 'undefined' ? window.matchMedia?.(REDUCED) : undefined;
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
};

const widths = { 1: 'basis-full', 2: 'basis-[85%] md:basis-1/2', 3: 'basis-[85%] md:basis-1/3', 4: 'basis-[45%] md:basis-1/4' } as const;

/**
 * Carrossel acessivel: `role="region"` + `aria-roledescription="carrossel"`,
 * scroll-snap nativo, `scrollIntoView` nos botoes e zero bibliotecas.
 * Respeita `prefers-reduced-motion` (rolagem instantanea).
 */
export function Carousel({ slides, label, perView = 1, labels = defaultLabels, autoplayMs, className }: CarouselProps) {
  const l = { ...defaultLabels, ...labels };
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;
  // Autoplay (WCAG 2.2.2): botao de pausa, pausa com hover/foco dentro, e nunca
  // inicia com prefers-reduced-motion. Sem `autoplayMs` nada disso existe.
  // A preferencia so existe no cliente: useSyncExternalStore (servidor = false) evita
  // divergencia de hidratacao e setState em efeito. Com reduced-motion o padrao e
  // parado; o usuario ainda pode iniciar pelo botao.
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [userPlay, setUserPlay] = useState<boolean | null>(null);
  const playing = Boolean(autoplayMs) && (userPlay ?? !reduced);
  const [engaged, setEngaged] = useState(false);

  const go = (to: number) => {
    const target = Math.min(last, Math.max(0, to));
    const reduce = prefersReducedMotion();
    itemRefs.current[target]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    setIndex(target);
  };

  useEffect(() => {
    if (!autoplayMs || !playing || engaged || last < 1) return;
    const id = window.setInterval(() => go(index >= last ? 0 : index + 1), autoplayMs);
    return () => window.clearInterval(id);
    // `go` so depende de refs e do indice; reagendar a cada indice e intencional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs, playing, engaged, index, last]);

  const onScroll = () => {
    const track = trackRef.current;
    const first = itemRefs.current[0];
    if (!track || !first) return;
    const next = Math.round(track.scrollLeft / first.offsetWidth);
    if (next !== index) setIndex(Math.min(last, Math.max(0, next)));
  };

  const btn = 'inline-flex size-11 items-center justify-center rounded-full border border-border-control bg-surface-raised disabled:opacity-50';

  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      className={cn('relative', className)}
      onMouseEnter={autoplayMs ? () => setEngaged(true) : undefined}
      onMouseLeave={autoplayMs ? () => setEngaged(false) : undefined}
      onFocus={autoplayMs ? () => setEngaged(true) : undefined}
      onBlur={autoplayMs ? () => setEngaged(false) : undefined}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        // Em rotacao automatica o leitor de tela nao deve ser interrompido (APG).
        aria-live={autoplayMs && playing && !engaged ? 'off' : 'polite'}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={l.slide(i + 1, slides.length)}
            className={cn('shrink-0 snap-start', widths[perView])}
          >
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {autoplayMs && (
            <button type="button" className={btn} aria-label={playing ? l.pause : l.play} aria-pressed={!playing} onClick={() => setUserPlay(!playing)}>
              <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
            </button>
          )}
          <button type="button" className={btn} aria-label={l.previous} disabled={index === 0} onClick={() => go(index - 1)}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className={btn} aria-label={l.next} disabled={index === last} onClick={() => go(index + 1)}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </section>
  );
}
