import { Badge, ChevronDownIcon, Overlay } from '@nears/ui';
import { NAV_DRAWER_ID } from '../header/header.tsx';
import type { NavDrawerProps } from './nav-drawer.schema';

const defaults = { title: 'Menu', nav: 'Departamentos', viewAll: 'Ver tudo em', close: 'Fechar menu' } as const;

const row = 'inline-flex min-h-11 w-full items-center px-4 text-md';

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
                      <a href={dep.href} className={`${row} font-medium underline underline-offset-4`}>
                        {l.viewAll} {dep.label}
                      </a>
                      {dep.highlight && (
                        <a href={dep.highlight.href} className={`${row} gap-2 text-badge-promo-bg`}>
                          <Badge tone="promo">{dep.highlight.label}</Badge>
                        </a>
                      )}
                      {dep.groups?.map((group) => (
                        <div key={group.label} className="pt-2">
                          {group.href ? (
                            <a href={group.href} className={`${row} font-medium`}>
                              {group.label}
                            </a>
                          ) : (
                            <p className="px-4 pt-2 text-sm font-medium text-on-surface-muted">{group.label}</p>
                          )}
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <a href={link.href} className={`${row} text-on-surface-muted`}>
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {dep.promo && (
                        <a href={dep.promo.href} className={`${row} font-medium underline underline-offset-4`}>
                          {dep.promo.title}
                        </a>
                      )}
                    </div>
                  </details>
                ) : (
                  <a href={dep.href} className={`${row} font-medium`}>
                    {dep.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </Overlay>
  );
}
