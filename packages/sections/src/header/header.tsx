import { BagIcon, HeartIcon, Image, MenuIcon, OverlayTrigger, SearchIcon, UserIcon } from '@nears/ui';
import type { ReactNode } from 'react';
import type { HeaderProps } from './header.schema';

/** Ids dos overlays que o header abre (as sections nav-drawer e minicart usam os mesmos). */
export const NAV_DRAWER_ID = 'nav-drawer';
export const MINICART_ID = 'minicart';

const defaults = {
  skip: 'Ir para o conteúdo',
  menu: 'Menu',
  search: 'Buscar',
  searchLabel: 'O que você procura?',
  searchPlaceholder: 'Digite o nome do produto',
  searchSubmit: 'Buscar',
  account: 'Minha conta',
  wishlist: 'Favoritos',
  cart: 'Carrinho',
} as const;

const iconBox = 'relative inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-subtle';

const countLabel = (label: string, count: number) =>
  count > 0 ? `${label}, ${count > 99 ? '99+' : count} ${count === 1 ? 'item' : 'itens'}` : label;

function Count({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-badge-promo-bg px-1 text-2xs font-bold text-badge-promo-on"
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}

function ActionLink({ href, label, count = 0, children }: { href: string; label: string; count?: number; children: ReactNode }) {
  return (
    <a href={href} aria-label={countLabel(label, count)} className={iconBox}>
      {children}
      <Count value={count} />
    </a>
  );
}

/**
 * Skip link: primeiro foco da pagina; o destino (`#conteudo`) vem do layout. Fica no Header
 * por padrao; o layout raiz o renderiza antes da PromoBar (`skipLink={false}` no Header) para
 * que nada receba foco antes dele (WCAG 2.4.1, docs/adr/0026).
 */
export function SkipLink({ label = defaults.skip, href = '#conteudo' }: { label?: string; href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-surface-inverse focus:px-4 focus:text-on-inverse"
    >
      {label}
    </a>
  );
}

/**
 * Header: logo centralizado, hamburger (abre o NavDrawer), busca, e conta,
 * favoritos e carrinho com badge. Server Component: o unico JS e o
 * `OverlayTrigger` (ilha minima). Altura reservada de 56px (`cwv.reservedHeight`).
 *
 * Variantes (nears/sections.registry.yaml > variantRules): `full`; `minimal`
 * (PDP: so logo e carrinho); `none` (so o skip link).
 */
export function Header({
  logo,
  homeHref = '/',
  nav,
  search = true,
  searchHref = '/s',
  account = true,
  accountHref = '/account',
  wishlist = true,
  wishlistHref = '/account/favoritos',
  cart = true,
  cartCount = 0,
  wishlistCount = 0,
  variant = 'full',
  skipLink = true,
  labels,
}: HeaderProps) {
  const l = { ...defaults, ...labels };
  const full = variant === 'full';

  return (
    <>
      {skipLink && <SkipLink label={l.skip} />}
      {variant !== 'none' && (
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 md:px-4">
            <div className="flex items-center gap-1">
              {full && nav && nav.departments.length > 0 && (
                <OverlayTrigger targetId={NAV_DRAWER_ID} aria-controls={NAV_DRAWER_ID} aria-label={l.menu} className={iconBox}>
                  <MenuIcon />
                </OverlayTrigger>
              )}
              {full && search && (
                <>
                  <a href={searchHref} aria-label={l.search} className={`${iconBox} md:hidden`}>
                    <SearchIcon />
                  </a>
                  <form role="search" aria-label={l.search} action={searchHref} method="get" className="hidden items-center md:flex">
                    <label htmlFor="header-search" className="sr-only">
                      {l.searchLabel}
                    </label>
                    <input
                      id="header-search"
                      name="q"
                      type="search"
                      placeholder={l.searchPlaceholder}
                      className="min-h-11 w-56 rounded-l-md border border-border-control bg-surface px-3 lg:w-72"
                    />
                    <button type="submit" aria-label={l.searchSubmit} className={`${iconBox} rounded-l-none border border-l-0 border-border-control`}>
                      <SearchIcon />
                    </button>
                  </form>
                </>
              )}
            </div>

            <a href={homeHref} className="inline-flex min-h-11 items-center justify-center px-2">
              <Image src={logo.src} width={logo.width} height={logo.height} alt={logo.alt} priority className="h-8 w-auto" />
            </a>

            <div className="flex items-center justify-end gap-1">
              {full && account && (
                <ActionLink href={accountHref} label={l.account}>
                  <UserIcon />
                </ActionLink>
              )}
              {full && wishlist && (
                <ActionLink href={wishlistHref} label={l.wishlist} count={wishlistCount}>
                  <HeartIcon />
                </ActionLink>
              )}
              {cart && (
                <OverlayTrigger targetId={MINICART_ID} aria-controls={MINICART_ID} aria-label={countLabel(l.cart, cartCount)} className={iconBox}>
                  <BagIcon />
                  <Count value={cartCount} />
                </OverlayTrigger>
              )}
            </div>
          </div>
        </header>
      )}
    </>
  );
}
