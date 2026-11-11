import { Container } from '@nears/ui';
import type { BenefitBarProps } from './benefit-bar.schema';

/**
 * Faixa de vantagens. Lista real; no mobile rola na horizontal com scroll-snap
 * nativo (a lista e focavel para rolar por teclado), no desktop distribui os itens.
 * Altura reservada de 44px (`cwv.reservedHeight`) evita layout shift.
 */
export function BenefitBar({ items, label = 'Vantagens' }: BenefitBarProps) {
  return (
    <section aria-label={label} className="mb-20">
      <Container
        as="ul"
        tabIndex={0}
        className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const content = (
            <>
              {item.icon && (
                <span aria-hidden="true" className="text-lg leading-none">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </>
          );
          const row = 'flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface-raised px-5 py-3 text-sm font-medium whitespace-nowrap md:h-full';
          return (
            <li key={item.label} className="snap-start">
              {item.href ? (
                <a href={item.href} className={`${row} underline-offset-4 hover:underline`}>
                  {content}
                </a>
              ) : (
                <span className={row}>{content}</span>
              )}
            </li>
          );
        })}
      </Container>
    </section>
  );
}
