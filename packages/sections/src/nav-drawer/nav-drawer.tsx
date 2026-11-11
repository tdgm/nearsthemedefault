import { Badge, ChevronDownIcon, Link, Overlay } from '@nears/ui';
import { NAV_DRAWER_ID } from '../header/header.tsx';
import type { NavDrawerProps } from './nav-drawer.schema';

const defaults = { title: 'Menu', nav: 'Departamentos', viewAll: 'Ver tudo em', close: 'Fechar menu' } as const;

/** Mesmo `Link` do design system (ADR 0034): largura total e padding proprios do drawer entram via `className`. */
const row = 'w-full px-4 text-md';

/**
 * Menu multinivel por departamento. TODOS os links ficam no HTML inicial (o
 * `<dialog>` fechado e `<details>` fechados continuam no DOM: indexaveis e sem
 * JS). Abrir e do `OverlayTrigger` do header; nada aqui hidrata (`cwv.jsOnInteraction`).
 */
export function NavDrawer({ departments, labels }: NavDrawerProps) {
  const l = { ...defaults, ...labels };
  return (
    <Overlay id={NAV_DRAWER_ID} title={l.title} closeLabel={l.close} side="left">
      <nav aria-label={l.nav}>
        <ul className="divide-y divide-border">
          {departments.map((dep) => {
            const hasChildren = Boolean(dep.groups?.length || dep.highlight || dep.promo);
            return (
              <li key={dep.href}>
                {hasChildren ? (
                  <details className="group">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 font-medium [&::-webkit-details-marker]:hidden">
                      {dep.label}
                      <span aria-hidden="true" className="transition-transform duration-(--nears-duration-fast) group-open:rotate-180">
                        <ChevronDownIcon />
                      </span>
                    </summary>
                    <div className="bg-surface-subtle pb-2">
                      <Link href={dep.href} variant="standalone" className={`${row} font-medium`}>
                        {l.viewAll} {dep.label}
                      </Link>
                      {dep.highlight && (
                        <a href={dep.highlight.href} className={`${row} inline-flex min-h-11 items-center gap-2`}>
                          <Badge tone="promo">{dep.highlight.label}</Badge>
                        </a>
                      )}
                      {dep.groups?.map((group) => (
                        <div key={group.label} className="pt-2">
                          {group.href ? (
                            <Link href={group.href} variant="standalone" className={`${row} font-medium`}>
                              {group.label}
                            </Link>
                          ) : (
                            <p className="px-4 pt-2 text-sm font-medium text-on-surface-muted">{group.label}</p>
                          )}
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link href={link.href} variant="standalone" className={row}>
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {dep.promo && (
                        <Link href={dep.promo.href} variant="standalone" className={`${row} font-medium`}>
                          {dep.promo.title}
                        </Link>
                      )}
                    </div>
                  </details>
                ) : (
                  <Link href={dep.href} variant="standalone" className={`${row} font-medium`}>
                    {dep.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </Overlay>
  );
}
