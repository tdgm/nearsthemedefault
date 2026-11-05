# ADR 0015 - Sections de conteudo (`packages/sections`)

- Status: aceito
- Data: 2026-11-05

## Contexto

A Fase 5 (docs/ROADMAP.md) entrega as sections de conteudo. Gate: Hero e LCP em
<= 2.0s no perfil mobile throttled e CLS 0 em todas; JS inicial continua <= 140 KB
(docs/adr/0010; folga de 3.4 KB depois da Fase 4, docs/adr/0014).

## Decisao (leva A: sections estaticas e de texto)

1. **Zero JS novo.** Nenhuma das 11 sections da leva A e Client Component. Rolagem
   horizontal e CSS (scroll-snap) e as faixas rolaveis recebem `tabIndex=0` para
   teclado; recolher/expandir e `<details>` nativo.
2. **`richtext` = paragrafos de texto puro.** O tipo `richtext` do manifest e
   renderizado como `<p>` (paragrafos separados por linha em branco, helper
   `shared/paragraphs.ts`). HTML cru nao e aceito: ainda nao ha sanitizador decidido
   e `dangerouslySetInnerHTML` sem ele e vetor de XSS. Listas, negrito e links dentro
   do texto entram quando houver ADR proprio do sanitizador (e o peso em KB).
3. **TextSEO.** O primeiro paragrafo (a resposta direta do GEO) fica sempre visivel;
   o resto vai num `<details>` com todo o conteudo no HTML inicial. Em navegadores
   com `::details-content`, `collapsedHeight` define o trecho visivel quando
   recolhido; sem suporte, o resto aparece ao expandir. Nenhum conteudo depende de JS.
4. **BannerFull: texto ao lado da imagem, nunca sobre ela.** O contraste vem de
   superficie solida dos tokens (`tokens:contrast`), nao da foto; evita o caso de
   foto clara/escura derrubar o AA. Ganha `href` (o CTA precisa de destino) e
   `imageSide`.
5. **EventBanner: `<picture>` com `width`/`height` no `<source>` e no `<img>`**, para
   reservar o espaco certo nos dois formatos (CLS 0). AVIF/WebP entram com o loader de
   CDN na Fase 6; hoje e uma fonte por formato de arte.
6. **CategoryHub recebe `items` (lista) e `limit`.** O manifest antigo declarava
   `items: number` + `item` (so a forma); o template (`repeat` por departamento) passa a
   lista ja resolvida. `limit` (padrao 6) corta.
7. **QuickFilter: chips sao links (GET).** `chipHref` gera o href (parametros em ordem
   alfabetica, toggle quando o chip ja esta ativo) e `rel="nofollow"` quando o resultado
   combina mais de uma faceta, para nao abrir crawl infinito. A politica final de
   index/noindex/canonical das facetas e da Fase 6.
8. **RelatedLinks rejeita ancora generica** ("clique aqui", "saiba mais"...) no schema
   (`seo.descriptiveAnchors: enforced`).
9. **Props acrescentadas ao manifest** (o teste de paridade exige schema = manifest):
   `benefit-bar.label`, `breadcrumb.label`, `text-seo.labels`, `faq.title`,
   `banner-full.href|imageSide`, `quick-filter.basePath|current|labels`,
   `category-hub.items|limit|labels`.

## Decisao (leva B: hero, product-card, product-grid, showcase)

10. **Hero sobre o `Carousel` do design system.** Slide unico nao carrega JS; com varios,
    o `Carousel` (scroll-snap nativo, ja existente) cobre teclado e botoes. So o 1o slide
    e candidato a LCP (`<picture>` eager + `fetchpriority="high"`); os demais, lazy. O
    texto fica em faixa solida abaixo da arte (nunca sobre a foto) e o titulo e `<p>`
    (o H1 e do template). O manifest dizia `carousel: tablist`; adotamos o carrossel
    basico do APG (regiao + anterior/proximo), que pesa menos JS, e a pausa vira
    obrigatoria so quando `autoplay=true`.
11. **Autoplay opt-in no `Carousel`** (`autoplayMs`): desligado por padrao; quando ligado
    tem botao de pausa/retomar (`aria-pressed`), pausa com hover e foco dentro, nao inicia
    com `prefers-reduced-motion` (lido no cliente apos hidratar, para nao quebrar a
    hidratacao) e `aria-live` fica `off` enquanto gira. Custo: ~0.4 KB gzip no `@nears/ui`.
12. **ProductCard (`priority: inherit`).** O container passa `priority` (acima da dobra =
    eager + fetchpriority alto), `aspect` (token `media.aspect`) e `sizes`. O card nao e
    um link unico (tem acoes); o link da imagem fica fora do Tab e do leitor de tela e o
    nome e o link principal. Favoritar e adicionar rapido sao formularios POST que so
    existem quando o container informa o endpoint (`wishlistAction`, `quickAddAction`):
    funcionam sem JS e sem criar controle morto. Produto com variacao deve mandar o
    cliente para a PDP (container define `quickAdd=false`).
13. **ProductGrid sem estado de cliente.** Ordenacao (form GET + select), filtros (form GET
    dentro do drawer `<dialog>`, via `Overlay`) e paginacao (links `?page=N`, pagina 1 =
    URL limpa, `rel` prev/next) funcionam sem JS; o unico JS e o `OverlayTrigger`, que ja
    esta no bundle do header. Primeira linha (`columns.lg`) eager; depois de duas linhas,
    `content-visibility: auto` com tamanho intrinseco. `facets` continua sendo a lista de
    ids permitida pelo nicho; as opcoes (`filters`) vem do data layer.
14. **Showcase.** Cinco variantes pela prop `variant` (o template escreve `showcase:tabs`).
    `tabs` usa o `Tabs` do design system com todos os paineis no HTML (`hidden`); quando o
    data layer enviar so a 1a aba (`ssrFirstTab`), as outras carregam sob demanda na Fase 6.
    Variante sem produtos some, exceto `wishlist`, que explica o vazio.
15. **Props acrescentadas ao manifest** na leva B: `hero.intervalMs|labels`,
    `product-card.href|quickAddAction|wishlistAction|aspect|priority|sizes|labels`,
    `product-grid.products|total|page|basePath|query|currentSort|filters|labels`,
    `showcase.variant|products|labels`.

## Consequencias

- Nenhuma dependencia nova. JS inicial: ver o resultado do `pnpm validate` no PR (gate de
  140 KB, ADR 0010); se estourar, o Carousel do Hero passa a carregar sob demanda.
- Fica para a Fase 6: data layer (produtos, facetas, ordenacao), endpoints de favoritar e
  adicionar, escolha de `priority` por template, loader de imagem AVIF/WebP.
- Fica para a Fase 7: JSON-LD (ItemList, FAQPage, BreadcrumbList) a partir dos mesmos props.
