'use client';

// scroll-snap nativo + scrollBy. Zero libs de carrossel (CLAUDE.md > Stack
// e > Performance: "Carrossel usa scroll-snap nativo + scrollIntoView. Zero libs.").
import { useRef, type ReactNode } from 'react';
import { IconButton } from './icon-button';

export type CarouselProps = {
  /** Rotulo da regiao, para leitor de tela (ex.: "Produtos relacionados"). */
  label: string;
  children: ReactNode[];
};

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={direction === 'left' ? 'M12.5 5 7.5 10 12.5 15' : 'M7.5 5 12.5 10 7.5 15'} />
    </svg>
  );
}

export function Carousel({ label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    // jsdom (testes) nao implementa scrollBy - guarda evita quebrar o teste.
    if (!track || typeof track.scrollBy !== 'function') return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  }

  return (
    <div className="relative" role="region" aria-label={label}>
      <div
        ref={trackRef}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
      >
        {children.map((child, index) => (
          // Itens de carrossel nao tem id proprio aqui; a lista e estavel (nao reordena em runtime).
          <div key={index} className="shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <IconButton aria-label="Itens anteriores" variant="outline" size="sm" onClick={() => scroll(-1)} icon={<ArrowIcon direction="left" />} />
        <IconButton aria-label="Próximos itens" variant="outline" size="sm" onClick={() => scroll(1)} icon={<ArrowIcon direction="right" />} />
      </div>
    </div>
  );
}
