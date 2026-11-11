# 0034 - Consolidacao de CSS global: Container, Link e IconButton

## Status

Aceita.

## Contexto

Auditoria do design system (foco em CSS global, Header e Menu) encontrou:

1. `mx-auto max-w-7xl px-4` repetido a mao em 15 arquivos (`header`, `footer`,
   `product-grid`, `category-hub`, `banner-grid`, `banner-full`, `showcase`,
   `benefit-bar`, `related-links`, `quick-filter`, `section-title`,
   `breadcrumb`, `promo-bar-client`, `apps/web/app/s/page.tsx`,
   `apps/web/lib/templates/not-found.tsx` e `pdp.tsx`). Nao existia um
   `Container` em `@nears/ui`.
2. `header.tsx`, `nav-drawer.tsx` e `footer.tsx` reimplementavam a mao o que
   `@nears/ui` ja oferece: `iconBox`/`Count` proprios no Header (em vez de
   `IconButton`/`CountBadge`) e `row`/`linkClass` proprios no NavDrawer/Footer
   (em vez de `Link variant="standalone"`). Resultado pratico: nenhum link de
   navegacao do site (nav do Header, mega-menu, drawer, footer) usava a cor
   semantica `text-link` - so 4 ocorrencias no repo todo, todas dentro do
   proprio `@nears/ui`. O `iconBox` do Header tambem usava `rounded-md` (4px)
   enquanto `IconButton`/`Button` usam `rounded-control` (pilula) - os botoes
   de icone do Header tinham cantos diferentes do resto do sistema. O badge de
   contador existia duplicado (offset `-top-0.5` no Header vs `-top-1` no
   `IconButton`).

## Decisao

### `Container` (novo, `@nears/ui`)

`mx-auto max-w-7xl px-4` + prop `as` (elemento semantico: div/section/nav/
footer/main/p/ul/heading). Os 15 arquivos acima passam a usar `Container`
(ou `Container as="x"`) em vez do literal repetido. Excecao documentada:
`header.tsx` mantem seu proprio wrapper (`px-2 md:px-4` + layout flex) porque
o gutter responsivo do Header e diferente do padrao de container de secao -
compor isso dentro de `Container` via `className` arriscaria colisao de
`px-*` na mesma categoria de utilitario sem garantia de ordem no CSS gerado.

### `iconButtonClasses` / `countLabel` / `CountBadge` (novo, exportado de
`icon-button.tsx`)

As classes de botao de icone (44x44, `rounded-control`), a formatacao do
nome acessivel com contagem e o selo numerico passam a ser exportados
isoladamente (o proprio `IconButton` agora so compoe os tres). Isso permite
reusar o MESMO visual num elemento que nao e `<button>` (o hamburger e o
carrinho usam `OverlayTrigger`, que renderiza `<button>` via spread de
props; conta/favoritos/busca sao `<a>` de navegacao de verdade). Header
(`ActionLink`, `CartButton`, hamburger, busca) passa a usar os tres em vez
de `iconBox`/`Count` proprios.

### `Link variant="standalone"` para toda navegacao em texto

Header (nav inline, mega-menu, "ver tudo", promo), NavDrawer (`row`) e
Footer (`linkClass`) passam a usar `Link` do design system em vez de `<a>`
com classe a mao. Consequencia aceita: todo link de navegacao do site passa
a usar a cor `text-link` e sublinha so no hover (antes alguns - "ver tudo",
promo - vinham sempre sublinhados; os filhos do mega-menu vinham em cinza
`text-on-surface-muted` como hierarquia visual propria). Simplifica para o
UNICO estilo de link que o design system define, em vez de inventar uma
segunda variante "muted" so para o mega-menu - trade-off deliberado por
consistencia; hierarquia entre item principal e filho continua via
`font-medium` (peso), nao mais via cor.

Excecoes mantidas como `<a>` simples (nao `Link`): links que envolvem um
`Badge` (destaque do departamento) ou uma imagem (selo do rodape) - natureza
de chip/imagem, nao de link de texto, mesmo raciocinio do `RelatedLinks`
(chips com borda) que ja nao usa `text-link`.

## Consequencias

- Zero token novo, zero mudanca de schema/manifest/registry.
- `@nears/ui` ganha 1 componente (`Container`) e 3 exports novos de
  `icon-button.tsx`; `IconButton` em si nao muda de comportamento (so
  refatorado por dentro), confirmado pelos testes existentes do componente.
- Qualquer mudanca futura de gutter/max-width de secao passa a um lugar so.
- Radius dos botoes de icone do Header (hamburger, busca, conta, favoritos,
  carrinho) muda de `rounded-md` (4px) para `rounded-control` (pilula),
  igual ao resto dos controles do sistema. O botao de busca dentro do campo
  de busca mantem o canto esquerdo reto (`rounded-l-none`) e ganha
  `rounded-r-md` explicito para continuar casando com o input (mesmo
  mecanismo de override por utilitario direcional que o codigo ja usava).
