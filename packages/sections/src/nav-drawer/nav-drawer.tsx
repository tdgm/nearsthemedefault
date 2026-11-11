import { Badge, ChevronDownIcon, Overlay } from '@nears/ui';
import { NAV_DRAWER_ID } from '../header/header.tsx';
import type { NavDrawerProps } from './nav-drawer.schema';

const defaults = { title: 'Menu', nav: 'Departamentos', viewAll: 'Ver tudo em', close: 'Fechar menu' } as const;

/**
 * Link do drawer: `<a>` simples herdando `on-brand` (o `Link` do design system fixa `text-link`, que e
 * marinho e some no fundo marinho; ADR 0038). Alvo de 44px, sublinhado no hover.
 */
const row = 'flex min-h-11 w-full items-center px-4 text-md underline-offset-4 hover:underline';

/**
 * Menu multinivel por departamento. TODOS os links ficam no HTML inicial (o
 * `<dialog>` fechado e `<details>` fechados continuam no DOM: indexaveis e sem
 * JS). Abrir e do `OverlayTrigger` do header; nada aqui hidrata (`cwv.jsOnInteraction`).
 */
export function NavDrawer({ departments, labels }: NavDrawerProps) {
  const l = { ...defaults, ...labels };
  return (
    <Overlay id={NAV_DRAWER_ID} title={l.title} closeLabel={l.close} side="left" tone="brand">
      <nav aria-label={l.nav}>
        <ul className="space-y-1 p-2">
          {departments.map((dep) => {
            const hasChildren = Boolean(dep.groups?.length || dep.highlight || dep.promo);
            return (
              <li key={dep.href}>
                {hasChildren ? (
                  <details className="group">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-md px-4 font-medium group-open:bg-action group-open:font-bold group-open:text-action-on [&::-webkit-details-marker]:hidden">
                      {dep.label}
                      <span aria-hidden="true" className="transition-transform duration-(--nears-duration-fast) group-open:rotate-180">
                        <ChevronDownIcon />
                      </span>
                    </summary>
                    <div className="rounded-md bg-on-brand/10 pb-2">
                      <a href={dep.href} className={`${row} font-medium`}>
                        {l.viewAll} {dep.label}
                      </a>
                      {dep.highlight && (
                        <a href={dep.highlight.href} className={`${row} gap-2`}>
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
                            <p className="px-4 pt-2 text-sm font-medium opacity-80">{group.label}</p>
                          )}
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <a href={link.href} className={row}>
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {dep.promo && (
                        <a href={dep.promo.href} className={`${row} font-medium`}>
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
