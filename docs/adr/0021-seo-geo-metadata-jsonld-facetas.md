# ADR 0021 - SEO e GEO: metadata, JSON-LD, robots, sitemap, llms.txt e facetas (Fase 7)

- Status: aceito
- Data: 2026-11-05

## Contexto

A Fase 6 entregou todos os templates com titulo e descricao minimos e um `noindex`
global no layout. A Fase 7 precisa tornar cada template indexavel e citavel por
motores generativos sem quebrar os budgets (JS inicial ja em 139,3 KB de 140) e sem
nenhuma dependencia nova.

## Decisao

### 1. Um modulo, `apps/web/lib/seo`

| Arquivo | Papel |
| --- | --- |
| `site.ts` | URL publica da loja (`SITE_URL`, server-only) e URLs absolutas. |
| `metadata.ts` | `buildMetadata`: canonical, hreflang, Open Graph, Twitter Card e robots por template. |
| `jsonld.ts` | Construtores tipados de JSON-LD (Organization, WebSite+SearchAction, BreadcrumbList, ItemList, CollectionPage, FAQPage, WebPage, Product). |
| `geo.ts` | Completude GEO do Product e a politica `onMissingGeoField`. |
| `facets.ts` | Politica de canonical/robots para facetas, ordenacao e paginacao. |
| `robots.ts`, `sitemap.ts`, `llms.ts` | Geradores de `robots.txt`, `sitemap.xml` segmentado e `llms.txt`. |
| `ai-referral*.ts(x)` | Atribuicao de trafego de motores generativos. |

Nenhuma rota escreve `<meta>` ou JSON-LD a mao. Todo JSON-LD sai de um unico bloco
`@graph` por pagina, renderizado em Server Component (existe no HTML inicial, sem JS).
O layout so define `metadataBase`, nome da aplicacao e o sufixo de titulo
(`contracts.yaml > seo.global.titleTemplate`); o `noindex` global saiu.

### 2. Schemas por template (`contracts.yaml > seo.byTemplate`)

- home: Organization + WebSite/SearchAction. collection e longtail: BreadcrumbList,
  CollectionPage com ItemList da pagina e FAQPage. pdp: BreadcrumbList, Product/Offer/
  AggregateRating/Review e FAQPage. landing: WebPage + BreadcrumbList. page e sitemap:
  WebPage. busca e 404: nenhum, `noindex,nofollow`.
- `Product` so e completo com `aggregateRating`, `shippingDetails` e
  `hasMerchantReturnPolicy`. Os dois ultimos vem de `store.policies`; o primeiro, do
  dado. Campo ausente e OMITIDO (nunca inventado) e reportado por `missingGeoFields`.
- `onMissingGeoField` passou a **`fail-build`**: produto sem campo GEO derruba o
  prerender da PDP. Uma loja que ainda nao tem avaliacoes pode rebaixar para
  `warn-build` no proprio config enquanto coleta as primeiras.
- `priceValidUntil` vem do dado, nunca de "agora": o build fica deterministico e
  compativel com `cacheComponents`.
- Entidade (NAP, `sameAs`, `foundingDate`, `taxId`) e politicas comerciais ficam em
  `store.organization` e `store.policies` no data layer (CMS/painel): uma fonte unica
  para JSON-LD, `llms.txt` e rodape.
- Lacuna conhecida: `ProductGroup`/`hasVariant` exige um SKU por combinacao de
  variacao, que o contrato de dados ainda nao traz. Ate la o produto sai como
  `Product` unico; nada de SKU de variacao e inventado.

### 3. `robots.txt`, sitemap e `llms.txt`

- **robots.txt** sai de `routes.manifest.yaml > excluded` e `contracts.yaml > geo.agents`.
  Cada segmento vira tres linhas exatas (`/seg$`, `/seg/`, `/seg?`), entao `/saias` e
  `/carrinho-de-bebe` continuam rastreaveis. Um grupo especifico de agente SUBSTITUI o
  grupo `*` (RFC 9309); por isso o agente liberado repete os `Disallow`. Agente em
  `decide` falha o build: a decisao de negocio nao pode ficar implicita.
- **sitemap.xml** e um indice (`/sitemap.xml`) que aponta para `/sitemap/{segmento}-{n}.xml`
  (`sitemapXml.segments`, `maxUrlsPerFile`). Segmento vazio nao aparece. Campanha fora da
  janela sai (a rota redireciona). `lastmod` so entra quando o dado informa. O segmento
  `sitemap` virou slug reservado. As rotas sao dinamicas (`connection()`, "agora" decide
  as campanhas) e cacheadas na CDN por 1 h com `stale-while-revalidate`.
- **llms.txt** (formato llmstxt.org) e gerado do data layer: resumo, fatos da entidade,
  politicas com numeros e datas, departamentos, campanhas, paginas e perfis oficiais.

### 4. Facetas, ordenacao e paginacao (`routes.manifest.yaml > canonical e facets`)

Regras aplicadas em `generateMetadata` (que passou a ler `searchParams`):

1. `sort` fora do padrao, faceta em `neverIndexable` (`price`...) ou fora de
   `catalog.facets.indexable` -> `noindex,follow`, canonical na colecao sem query.
2. Mais de uma faceta ou de um valor -> `noindex,follow`, canonical na colecao.
3. Uma faceta indexavel com um valor -> indexavel, canonical de si mesma
   (`/dep?brand=x`); a faceta `category` canonicaliza para a pagina de categoria.
4. Pagina > 1 so ganha canonical proprio (`?page=N`) e `rel prev/next` quando a URL e
   indexavel; caso contrario o canonical volta para a colecao.

As facetas indexaveis isoladas entram no segmento `brand` do sitemap. A query e sempre
serializada com chaves ordenadas (uma pagina nunca tem duas grafias).

Limite herdado do ADR 0018: o shell estatico traz a colecao sem filtros; o resultado
filtrado chega no stream. O HTML da resposta contem o conteudo final (bloco oculto do
Suspense) e os crawlers do Google renderizam JavaScript, entao a URL canonica de cada
faceta indexavel enxerga os produtos da faceta. Se a medicao mostrar o contrario, a
saida e dar caminho proprio a facetas indexaveis (`/dep/marca/x`), decisao fora desta fase.

Colecoes e landings enviam o fallback do `Suspense` e o resultado final na mesma
resposta. O JSON-LD sai so da renderizacao resolvida (a que le a URL): assim o HTML
bruto tem um unico bloco, sempre coerente com a URL pedida, mesmo para quem nao executa JS.

Correcao herdada da Fase 6b: as rotas de 1, 2 e 3 segmentos e a de cauda longa chamavam
`notFound()` dentro de um componente filho e respondiam 200 (soft 404). Agora a resolucao
e a chamada acontecem em `Page`, antes do JSX, e o status e 404 de verdade (ADR 0003).

Isso sozinho nao basta: com `cacheComponents` o Next serve um shell de fallback para
parametros fora de `generateStaticParams` e o status sai 200 na PRIMEIRA requisicao (so as
seguintes, ja cacheadas, saem 404). O crawler que descobre a URL errada veria um soft 404.
Por isso `apps/web/proxy.ts` pergunta a `lib/routing/known-path` se a URL existe (mesmos
resolvers das paginas: indice de slugs, cauda longa, produto) e, se nao, reescreve para um
caminho sem rota; o Next responde 404 real com `app/not-found.tsx`. O proxy so le o
pathname (nao le cookie nem header), entao nao torna nenhuma rota dinamica; a pagina
continua decidindo o resto (ex.: campanha fora da janela). Fora do matcher: `/api`,
`/_next` e qualquer caminho com extensao (robots.txt, llms.txt, sitemap/*.xml, imagens).
Custo: uma consulta ao indice de slugs (em memoria) por requisicao de pagina.

### 5. Atribuicao de trafego de IA

O servidor nao ve o `Referer` de paginas estaticas (ler header as tornaria dinamicas).
Um script inline de ~0,6 KB, no fim do `<body>`, classifica `document.referrer` e
`utm_source` contra `geo.attribution.referrerPatterns` e publica
`{event:'ai_referral', ai_source}` no `dataLayer` do tag manager. Pesa no HTML, nao no
bundle de JS (budget de JS intacto). Liga/desliga por `geo.attribution.trackAiReferrals`.
Quando a CSP completa (Fase 8) exigir hash/nonce, o texto do script e deterministico.

### 6. Rich Results

Nao ha como rodar o Rich Results Test do Google no CI. O gate e: testes unitarios dos
construtores com os campos exigidos pelo Google (Product, BreadcrumbList, ItemList,
FAQPage) e E2E que le o JSON-LD do HTML inicial (`e2e/seo.spec.ts`). A verificacao
manual no Rich Results Test fica no checklist de pre-deploy de cada loja.

## Consequencias

- `SITE_URL` passa a ser obrigatoria em producao (sem ela, o build avisa e usa
  `http://localhost:3000` em canonical, sitemap e JSON-LD). Ela e lida no BUILD (paginas
  estaticas, `robots.txt`, `llms.txt`) e no runtime (sitemap, colecoes): defina nos dois. Com multi-tenancy
  (ADR 0016) a base vem do resolver de dominio, nunca do header `Host`.
- `generateMetadata` das colecoes le `searchParams`: o metadata dessas rotas e resolvido
  no request. Paginas sem faceta continuam servindo o shell estatico.
- Nenhuma dependencia nova; JS inicial inalterado (todo o codigo novo roda no servidor).
- `categories:seo` do Lighthouse CI voltou a `error`.
