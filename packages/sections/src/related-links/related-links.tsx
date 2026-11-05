import type { RelatedLinksProps } from './related-links.schema';

/**
 * Linkagem interna programatica: lista de links com ancora descritiva (o schema
 * rejeita "clique aqui" e afins). `nav` nomeado pelo titulo; fecha todo template
 * junto com o TextSEO (CLAUDE.md).
 */
export function RelatedLinks({ title = 'Veja também', links }: RelatedLinksProps) {
  return (
    <nav aria-label={title} className="mx-auto max-w-7xl px-4 py-8 [contain-intrinsic-size:auto_160px] [content-visibility:auto]">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-full border border-border-control px-4 text-sm hover:bg-surface-subtle"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
