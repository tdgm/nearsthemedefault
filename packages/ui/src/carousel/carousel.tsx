"use client";
// Client Component: botoes anterior/proximo usam refs + scrollIntoView, e o scroll
// do usuario (gesto/teclado) sincroniza o indice. A rolagem em si e CSS nativo
// (scroll-snap): sem JS o carrossel continua navegavel por gesto e teclado.

import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';

export type CarouselProps = {
  slides: ReactNode[];
  /** Nome acessivel do carrossel (vira aria-label da regiao). Obrigatorio. */
  label: string;
  /** Slides visiveis por vez em telas largas (mobile mostra ~1,2 para sugerir rolagem). */
  perView?: 1 | 2 | 3 | 4;
  labels?: { previous: string; next: string; slide: (n: number, total: number) => string };
  className?: string;
};

const defaultLabels = {
  previous: 'Slide anterior',
  next: 'Próximo slide',
  slide: (n: number, total: number) => `${n} de ${total}`,
};

const widths = { 1: 'basis-full', 2: 'basis-[85%] md:basis-1/2', 3: 'basis-[85%] md:basis-1/3', 4: 'basis-[45%] md:basis-1/4' } as const;

/**
 * Carrossel acessivel: `role="region"` + `aria-roledescription="carrossel"`,
 * scroll-snap nativo, `scrollIntoView` nos botoes e zero bibliotecas.
 * Respeita `prefers-reduced-motion` (rolagem instantanea).
 */
export function Carousel({ slides, label, perView = 1, labels = defaultLabels, className }: CarouselProps) {
  const l = { ...defaultLabels, ...labels };
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const go = (to: number) => {
    const target = Math.min(last, Math.max(0, to));
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    itemRefs.current[target]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    setIndex(target);
  };

  const onScroll = () => {
    const track = trackRef.current;
    const first = itemRefs.current[0];
    if (!track || !first) return;
    const next = Math.round(track.scrollLeft / first.offsetWidth);
    if (next !== index) setIndex(Math.min(last, Math.max(0, next)));
  };

  const btn = 'inline-flex size-11 items-center justify-center rounded-full border border-border-control bg-surface-raised disabled:opacity-50';

  return (
    <section role="region" aria-roledescription="carrossel" aria-label={label} className={cn('relative', className)}>
      <ul
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <li
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
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2">
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
