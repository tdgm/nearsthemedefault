import {
  BagIcon,
  Badge,
  ChevronDownIcon,
  CountBadge,
  HeartIcon,
  Image,
  Link,
  MenuIcon,
  OverlayTrigger,
  SearchIcon,
  UserIcon,
  countLabel,
  iconButtonClasses,
} from '@nears/ui';
import type { ReactNode } from 'react';
import type { HeaderProps } from './header.schema';
import type { NavDepartment } from '../shared/navigation.ts';

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
  nav: 'Departamentos',
  account: 'Minha conta',
  wishlist: 'Favoritos',
  cart: 'Carrinho',
  viewAll: 'Ver tudo em',
} as const;

/** Link de navegacao so com icone (conta, favoritos): mesmo visual/radius do `IconButton` (ADR 0034), mas `<a>` de verdade. */
function ActionLink({ href, label, count = 0, children }: { href: string; label: string; count?: number; children: ReactNode }) {
  return (
    <a href={href} aria-label={countLabel(label, count)} className={iconButtonClasses('tertiary')}>
      {children}
      <CountBadge value={count} />
    </a>
  );
}

/**
 * Botao do carrinho (abre o Minicart). Exportado para o app layer poder
 * renderizar uma versao com a contagem real do cookie `nears_cart` numa ilha
 * dinamica PROPRIA (Fase 10, ADR 0029) sem precisar tornar o `Header` inteiro
 * dinamico - ver `cartTrigger` em `Header` abaixo.
 */
export function CartButton({ cartCount = 0, label }: { cartCount?: number; label: string }) {
  return (
    <OverlayTrigger targetId={MINICART_ID} aria-controls={MINICART_ID} aria-label={countLabel(label, cartCount)} className={iconButtonClasses('primary')}>
      <BagIcon />
      <CountBadge value={cartCount} />
    </OverlayTrigger>
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

/** Item da barra de departamentos: 48px de alto, sublinhado laranja (`action`) no hover/aberto (V1, ADR 0037). */
const deptItem =
  'inline-flex h-12 items-center border-b-[3px] border-transparent px-3.5 text-sm font-bold text-on-surface hover:border-action';

/**
 * Mega-menu por departamento, inline no header (so `lg:` pra cima). Mesmo dado
 * de `nav.departments` que o `NavDrawer` (off-canvas, so mobile) ja consome -
 * nenhum schema novo. Usa `<details>/<summary>` nativo (igual ao NavDrawer):
 * fechado, o painel some de verdade da arvore de acessibilidade (o navegador
 * cuida disso), sem precisar de JS pra abrir/fechar ou de `aria-hidden`
 * manual. Abre por clique (nao por hover): e a troca deliberada pra manter o
 * Header Server Component (ADR 0033) - um mega-menu por hover teria que ficar
 * sempre no DOM com so opacidade/visibilidade alternando, o que expõe os
 * links do painel fechado a leitores de tela que navegam em modo de leitura
 * linear (nao simulam foco/hover). Trade-off aceito: abrir outro departamento
 * nao fecha o anterior sozinho (nao ha JS pra isso); clicar no mesmo
 * `summary` fecha.
 */
function DepartmentMenu({ dep, viewAllLabel }: { dep: NavDepartment; viewAllLabel: string }) {
  return (
    // Sem `relative`: o painel ancora no <header> (lg:relative) e ocupa a largura toda.
    <details className="group">
      <summary className={`${deptItem} cursor-pointer list-none gap-1 group-open:border-action [&::-webkit-details-marker]:hidden`}>
        {dep.label}
        <span aria-hidden="true" className="transition-transform duration-(--nears-duration-fast) group-open:rotate-180">
          <ChevronDownIcon />
        </span>
      </summary>
      <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-surface shadow-lg">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-4">
          {dep.groups?.map((group) => (
            <div key={group.label}>
              {group.href ? (
                <Link href={group.href} variant="standalone" className="mb-1 text-md font-bold text-on-surface">
                  {group.label}
                </Link>
              ) : (
                <p className="mb-1 flex min-h-11 items-center text-md font-bold">{group.label}</p>
              )}
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} variant="standalone" className="text-sm text-on-surface-muted">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(dep.promo || dep.highlight) && (
            <a
              href={dep.promo?.href ?? dep.highlight?.href}
              className="flex min-h-48 flex-col justify-end gap-2 rounded-lg bg-surface-subtle p-5 no-underline hover:underline"
            >
              {dep.highlight && <Badge tone="promo">{dep.highlight.label}</Badge>}
              {dep.promo && <span className="text-xl font-bold text-on-surface">{dep.promo.title}</span>}
            </a>
          )}
        </div>
        <div className="border-t border-border bg-surface-subtle">
          <div className="mx-auto flex h-13 max-w-7xl items-center px-4">
            <Link href={dep.href} variant="standalone" className="text-sm font-bold">
              {viewAllLabel} {dep.label}
            </Link>
          </div>
        </div>
      </div>
    </details>
  );
}

/**
 * Header (V1 Nears, ADR 0037): linha 1 com logo, busca em pilula e conta/favoritos/
 * carrinho; linha 2 (`lg:` pra cima) com a barra de departamentos e mega-menu em
 * largura total (ver `DepartmentMenu`). Hamburger (abre o `NavDrawer`) so abaixo de `lg:`,
 * onde o header e uma linha so, sticky. Server Component: o unico JS e o `OverlayTrigger`
 * do carrinho/drawer (ilha minima); o mega-menu e `<details>` nativo.
 * Altura reservada: 56px no mobile (sticky, `cwv.reservedHeight`); 80 + 52px no desktop, onde
 * o header rola junto com a pagina (nao e sticky) para nao roubar tela.
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
  cartTrigger,
}: HeaderProps & {
  /**
   * Override do botao de carrinho (ReactNode ja construido pelo chamador,
   * tipicamente um `<Suspense>` em volta de uma ilha que le a contagem real -
   * Fase 10, ADR 0029). Fora do schema Zod de proposito: e composicao de
   * React, nunca dado de CMS. Ausente (Storybook, testes, `cartCount`
   * estatico): cai no `CartButton` interno de sempre.
   */
  cartTrigger?: ReactNode;
}) {
  const l = { ...defaults, ...labels };
  const full = variant === 'full';

  return (
    <>
      {skipLink && <SkipLink label={l.skip} />}
      {variant !== 'none' && (
        <header className="sticky top-0 z-40 border-b border-border bg-surface lg:relative">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-2 md:px-4 lg:h-20 lg:gap-8">
            {full && nav && nav.departments.length > 0 && (
              <OverlayTrigger targetId={NAV_DRAWER_ID} aria-controls={NAV_DRAWER_ID} aria-label={l.menu} className={`${iconButtonClasses('tertiary')} lg:hidden`}>
                <MenuIcon />
              </OverlayTrigger>
            )}

            <a href={homeHref} className="inline-flex min-h-11 items-center">
              <Image src={logo.src} width={logo.width} height={logo.height} alt={logo.alt} priority className="h-8 w-auto" />
            </a>

            {full && search && (
              <form
                role="search"
                aria-label={l.search}
                action={searchHref}
                method="get"
                className="hidden h-12 max-w-2xl flex-1 items-center rounded-control border border-border-control bg-surface pr-1 pl-5 md:flex"
              >
                <label htmlFor="header-search" className="sr-only">
                  {l.searchLabel}
                </label>
                <input
                  id="header-search"
                  name="q"
                  type="search"
                  placeholder={l.searchPlaceholder}
                  className="min-h-11 min-w-0 flex-1 rounded-control bg-transparent focus-visible:outline-2 focus-visible:outline-focus-ring"
                />
                <button type="submit" aria-label={l.searchSubmit} className={iconButtonClasses('primary')}>
                  <SearchIcon />
                </button>
              </form>
            )}

            <div className="ml-auto flex items-center gap-1">
              {full && search && (
                <a href={searchHref} aria-label={l.search} className={`${iconButtonClasses('tertiary')} md:hidden`}>
                  <SearchIcon />
                </a>
              )}
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
              {cart && (cartTrigger ?? <CartButton cartCount={cartCount} label={l.cart} />)}
            </div>
          </div>

          {full && nav && nav.departments.length > 0 && (
            <nav aria-label={l.nav} className="hidden lg:block">
              <ul className="mx-auto flex h-13 max-w-7xl items-center gap-2 px-4">
                {nav.departments.map((dep) =>
                  dep.groups?.length || dep.highlight || dep.promo ? (
                    <li key={dep.href}>
                      <DepartmentMenu dep={dep} viewAllLabel={l.viewAll} />
                    </li>
                  ) : (
                    <li key={dep.href}>
                      <Link href={dep.href} variant="standalone" className={`${deptItem} text-on-surface`}>
                        {dep.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          )}
        </header>
      )}
    </>
  );
}
