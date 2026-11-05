# ADR 0015 - Sections de conteudo (`packages/sections`)

- Status: aceito (leva A; a leva B - hero, product-card, product-grid, showcase - acrescenta decisoes abaixo)
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

## Pendente na leva B

Hero (LCP, art direction, autoplay opcional), ProductCard (`priority: inherit`),
ProductGrid e Showcase (static/tabs/personalized/wishlist/recommended).
