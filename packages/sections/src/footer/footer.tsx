import { Button, Checkbox, Image, Input, formatCNPJ } from '@nears/ui';
import type { FooterProps } from './footer.schema';

const defaults = {
  region: 'Rodapé',
  service: 'Atendimento',
  newsletterEmail: 'Seu e-mail',
  newsletterSegments: 'Quero receber novidades de',
  newsletterSubmit: 'Assinar',
  apps: 'Aplicativos',
  social: 'Redes sociais',
  seals: 'Selos de confiança',
  cnpj: 'CNPJ',
} as const;

const linkClass = 'inline-flex min-h-11 items-center underline-offset-4 hover:underline';

// Colunas colapsam so no mobile. O <details> nativo fecha o painel; a partir de md
// o `::details-content` volta a ficar visivel, entao o conteudo nunca depende de JS.
const detailsDesktopOpen = 'md:[&::details-content]:[content-visibility:visible]';

/**
 * Rodape: atendimento, newsletter segmentada, colunas de links, apps, redes, selos
 * e dados legais. Server Component sem nenhuma ilha client. Fica abaixo da dobra:
 * `content-visibility: auto` com `contain-intrinsic-size` declarado
 * (`cwv.containIntrinsicSize`).
 */
export function Footer({ service, newsletter, columns, apps, social, seals, legal, labels }: FooterProps) {
  const l = { ...defaults, ...labels };
  const showNewsletter = Boolean(newsletter?.action);

  return (
    <footer
      aria-label={l.region}
      className="mt-12 border-t border-border bg-surface-subtle [contain-intrinsic-size:auto_640px] [content-visibility:auto]"
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {(service?.length || showNewsletter) && (
          <div className="grid gap-8 border-b border-border pb-8 md:grid-cols-2">
            {service && service.length > 0 && (
              <section aria-labelledby="footer-service">
                <h2 id="footer-service" className="mb-2 text-lg font-heading">
                  {l.service}
                </h2>
                <dl className="grid gap-1">
                  {service.map((item) => (
                    <div key={item.label} className="flex flex-wrap gap-x-2">
                      <dt className="font-medium">{item.label}:</dt>
                      <dd>
                        {item.href ? (
                          <a href={item.href} className={linkClass}>
                            {item.value}
                          </a>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {showNewsletter && newsletter && (
              <section aria-labelledby="footer-newsletter">
                <h2 id="footer-newsletter" className="mb-1 text-lg font-heading">
                  {newsletter.title ?? 'Newsletter'}
                </h2>
                {newsletter.description && <p className="mb-3 text-on-surface-muted">{newsletter.description}</p>}
                <form action={newsletter.action} method="post" className="grid gap-3">
                  <Input label={l.newsletterEmail} name="email" type="email" autoComplete="email" required />
                  {newsletter.segments && newsletter.segments.length > 0 && (
                    <fieldset>
                      <legend className="mb-1 text-sm font-medium">{l.newsletterSegments}</legend>
                      <div className="flex flex-wrap gap-x-4">
                        {newsletter.segments.map((segment) => (
                          <Checkbox key={segment.id} name="segments" value={segment.id} label={segment.label} />
                        ))}
                      </div>
                    </fieldset>
                  )}
                  <div>
                    <Button type="submit">{l.newsletterSubmit}</Button>
                  </div>
                </form>
              </section>
            )}
          </div>
        )}

        {columns && columns.length > 0 && (
          <div className="grid gap-x-8 py-4 md:grid-cols-4 md:py-8">
            {columns.map((column) => (
              <details key={column.title} className={`group border-b border-border md:border-0 ${detailsDesktopOpen}`}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-bold md:pointer-events-none md:cursor-default [&::-webkit-details-marker]:hidden">
                  <h2 className="text-md">{column.title}</h2>
                  <span aria-hidden="true" className="text-xl leading-none transition-transform duration-(--nears-duration-fast) group-open:rotate-45 md:hidden">
                    +
                  </span>
                </summary>
                <ul className="pb-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}

        {(apps?.length || social?.length || seals?.length) && (
          <div className="grid gap-6 border-t border-border py-6 md:grid-cols-3">
            {apps && apps.length > 0 && (
              <nav aria-label={l.apps}>
                <ul className="flex flex-wrap gap-x-4">
                  {apps.map((app) => (
                    <li key={app.href}>
                      <a href={app.href} className={linkClass}>
                        {app.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {social && social.length > 0 && (
              <nav aria-label={l.social}>
                <ul className="flex flex-wrap gap-x-4">
                  {social.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} rel="noopener noreferrer" className={linkClass}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {seals && seals.length > 0 && (
              <ul aria-label={l.seals} className="flex flex-wrap items-center gap-4">
                {seals.map((seal) => {
                  const img = <Image src={seal.image.src} width={seal.image.width} height={seal.image.height} alt={seal.label} sizes="96px" className="h-10 w-auto" />;
                  return <li key={seal.label}>{seal.href ? <a href={seal.href} className="inline-flex min-h-11 items-center">{img}</a> : img}</li>;
                })}
              </ul>
            )}
          </div>
        )}

        {legal && (
          <div className="border-t border-border pt-6 text-sm text-on-surface-muted">
            <p>
              {legal.copyright ?? legal.companyName}
              {legal.cnpj && (
                <>
                  {' · '}
                  {l.cnpj} {formatCNPJ(legal.cnpj)}
                </>
              )}
            </p>
            {legal.address && <p>{legal.address}</p>}
            {legal.links && legal.links.length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-x-4">
                {legal.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
