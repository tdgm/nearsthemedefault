import { Badge, Button, Image, Price, buildAlt } from '@nears/ui';
import { illustrationFilter } from '../shared/illustration.ts';
import { fill } from '../shared/template.ts';
import type { ProductCardProps } from './product-card.schema';

const defaults = {
  wishlist: 'Favoritar {name}',
  quickAdd: 'Adicionar à sacola',
  variants: 'Opções disponíveis',
  more: 'mais {n}',
} as const;

const MAX_SWATCHES = 5;

/**
 * Card de produto (`priority: inherit`): o container diz se esta acima da dobra
 * (`priority`) e qual proporcao de midia usar (`aspect`).
 *
 * Acessibilidade: o card NAO e um link unico (`wholeCardLink: false`) porque tem
 * acoes proprias (favoritar, adicionar). A imagem e um link auxiliar fora da
 * ordem de Tab e do leitor de tela (o nome e o link principal, evita ler o mesmo
 * destino duas vezes); o `alt` continua gerado a partir do nome (SEO de imagem).
 * Favoritar e adicionar sao formularios POST: funcionam sem JS e so existem
 * quando o container informa o endpoint.
 */
export function ProductCard({
  image,
  hoverImage,
  name,
  href,
  price,
  listPrice,
  installments,
  badges,
  variantPreview,
  quickAdd = false,
  quickAddAction,
  wishlist = true,
  wishlistAction,
  aspect = 'portrait',
  priority = false,
  sizes,
  labels,
}: ProductCardProps) {
  const l = { ...defaults, ...labels };
  const swatches = variantPreview ?? [];
  const shown = swatches.slice(0, MAX_SWATCHES);
  const hidden = swatches.length - shown.length;
  return (
    <article className="group relative flex flex-col gap-2">
      <div className="relative">
        <a
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block overflow-hidden rounded-md bg-surface-subtle"
          style={{ aspectRatio: `var(--nears-aspect-${aspect})` }}
        >
          <Image
            src={image.src}
            alt={image.alt ?? buildAlt({ name })}
            width={image.width}
            height={image.height}
            priority={priority}
            sizes={sizes}
            className="size-full object-cover"
            style={{ filter: illustrationFilter(href) }}
          />
          {hoverImage && (
            <Image
              src={hoverImage.src}
              alt=""
              width={hoverImage.width}
              height={hoverImage.height}
              sizes={sizes}
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-(--nears-duration-fast) motion-reduce:transition-none [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </a>
        {badges && badges.length > 0 && (
          <ul className="pointer-events-none absolute start-2 top-2 flex flex-col items-start gap-1">
            {badges.map((badge) => (
              <li key={badge.label}>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </li>
            ))}
          </ul>
        )}
        {wishlist && wishlistAction && (
          <form method="post" action={wishlistAction} className="absolute end-1 top-1">
            <button
              type="submit"
              aria-label={fill(l.wishlist, { name })}
              className="inline-flex size-11 items-center justify-center rounded-full bg-surface-raised/90 text-lg"
            >
              <span aria-hidden="true">♡</span>
            </button>
          </form>
        )}
      </div>
      <h3 className="text-md font-medium">
        <a href={href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          {name}
        </a>
      </h3>
      {shown.length > 0 && (
        <ul aria-label={l.variants} className="flex flex-wrap items-center gap-1.5">
          {shown.map((swatch) => (
            <li key={swatch.label}>
              {swatch.color ? (
                <span
                  className="block size-4 rounded-full border border-border-control"
                  style={{ backgroundColor: swatch.color }}
                  role="img"
                  aria-label={swatch.label}
                />
              ) : (
                <span className="text-xs text-on-surface-muted">{swatch.label}</span>
              )}
            </li>
          ))}
          {hidden > 0 && <li className="text-xs text-on-surface-muted">+{hidden}</li>}
        </ul>
      )}
      <Price price={price} listPrice={listPrice} installments={installments} size="md" />
      {quickAdd && quickAddAction && (
        <form method="post" action={quickAddAction}>
          <Button type="submit" variant="secondary" size="sm" fullWidth>
            {l.quickAdd}
          </Button>
        </form>
      )}
    </article>
  );
}
