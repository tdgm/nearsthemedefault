import type { BenefitBarProps } from './benefit-bar.schema';

/**
 * Faixa de vantagens. Lista real; no mobile rola na horizontal com scroll-snap
 * nativo (a lista e focavel para rolar por teclado), no desktop distribui os itens.
 * Altura reservada de 44px (`cwv.reservedHeight`) evita layout shift.
 */
export function BenefitBar({ items, label = 'Vantagens' }: BenefitBarProps) {
  return (
    <section aria-label={label} className="border-y border-border bg-surface-subtle">
      <ul
        tabIndex={0}
        className="mx-auto flex min-h-11 max-w-7xl snap-x snap-mandatory items-center gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:justify-between [&::-webkit-scrollbar]:hidden"
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
          const row = 'flex min-h-11 shrink-0 items-center gap-2 text-sm whitespace-nowrap';
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
      </ul>
    </section>
  );
}
