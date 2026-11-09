# Roadmap de implementacao

Oito fases. Cada uma tem entregavel e gate. Nao avance com gate vermelho.

## Fase 0 - Fundacao

Entregar: monorepo pnpm, Next 16 App Router (docs/adr/0007), TS strict,
ESLint/Prettier, Vitest, Playwright, Storybook, Lighthouse CI, GitHub Actions.
As paginas criadas devem usar exatamente os caminhos de
`routes.manifest.yaml > appRoute` (inclusive o grupo ambiguo compartilhando
`/[slug]/page` e `/[slug]/[sub]/page` - ver nota no topo do manifest e
docs/adr/0003). O script `pnpm validate` ja deve falhar corretamente ao
estourar budget - teste com um import gigante proposital e depois remova.
Ver docs/adr/0005 para qual script/assertion cobre cada linha do orcamento.

**Gate:** CI verde em repo vazio; `scripts/check-budgets.mjs` roda sem erro
mesmo sem nenhuma rota implementada (so avisa "ainda nao implementadas"). CI
inclui desde esta fase, tambem em repo vazio: auditoria de dependencias
(`pnpm audit --audit-level=high`), scanner de segredos (gitleaks) e CodeQL,
todos com `permissions` em least-privilege (ver docs/adr/0008).

## Fase 1 - Tokens

Entregar: `packages/tokens/tokens.json` com escalas completas (neutral 0-1000,
brand, accent, semanticos), tipografia fluida com clamp, espaco base 4, radii,
shadows, z-index, breakpoints 360/768/1024/1280/1536 e motion. Build Style
Dictionary gerando CSS vars + preset Tailwind + JSON para Figma. Tema claro e
escuro. Troca de marca por substituicao de um unico arquivo. Loader de fonte
via `next/font/local` lendo `typography.font` (open source, self-hosted,
fallback websafe calculado no build) e modo `system` sem download.

**Gate:** contraste AA validado por teste automatizado em todos os pares semanticos;
build falha se a licenca da fonte nao for OFL-1.1 ou Apache-2.0.

## Fase 2 - Manifests e registry

Entregar: os quatro YAML em `/nears` com schemas Zod, loader tipado, geracao de
tipos a partir dos manifests, e um section registry que falha o build se uma
section nao declarar `priority`, `cwv` e `a11y`. Resolucao das referencias
`from:` e `enabledBy:` para os blocos `catalog` e `vocabulary`, gerando os tipos
de eixos de variacao e facetas do nicho configurado.

**Gate:** `pnpm validate` valida os manifests e gera os tipos para o preset
`generic` e para pelo menos dois presets de `docs/adr/0002-template-multinicho.md`.

**Entregue:** `packages/manifests` (schemas, referencias, props->Zod, tipos
gerados), `nears/presets/*.yaml` (6 nichos, todos validados no CI) e o registry em
`packages/sections`. Decisoes em `docs/adr/0012-manifests-zod-e-registry.md`.

## Fase 3 - Design system (packages/ui)

Entregar: Button, IconButton, Link, Input, Select, Checkbox, Radio, RadioGroup,
VariantSelector (exibicao swatch ou option, sempre radiogroup), Badge, Price,
Rating, Skeleton, Toast, Tooltip, Accordion,
Tabs, Modal, Drawer, Breadcrumb, Pagination, Carousel (scroll-snap nativo) e Image
(wrapper com picture + aspect-ratio obrigatorio).

**Gate:** 100% com story, teste e axe limpo. Bundle do pacote <= 25 KB gzip.

**Entregue:** `packages/ui` com os 21 componentes, `@nears/ui/format` (formatacao BR),
`scripts/check-ui-bundle.mjs` (gate de 25 KB) e decisoes em
`docs/adr/0013-design-system-packages-ui.md`.

## Fase 4 - Sections globais

Entregar: PromoBar com countdown (altura reservada, CLS zero), Header com variantes
full/minimal/none por padrao de rota, NavDrawer multi-eixo carregado so na
interacao, Minicart, Footer com colunas colapsaveis e CustomerService.
Componentes que usam `priority: inherit` (ex.: ProductCard) recebem a priority
resolvida do container como prop - nunca leem um valor fixo proprio
(docs/adr/0006).

**Gate:** JS inicial ainda <= 140 KB (docs/adr/0010) com header e footer montados; se nao couber, reduzir ilhas client antes de subir o limite.

**Entregue:** `packages/sections` com as 6 sections globais (spec, schema, meta, story e teste),
`Overlay`/`OverlayTrigger` e icones em `@nears/ui`, layout raiz montado. JS inicial 136.6 KB
(limite 140). Decisoes e adiamentos em `docs/adr/0014-sections-globais.md`.

## Fase 5 - Sections de conteudo

Entregar: Hero, BenefitBar, SectionTitle, BannerGrid, CategoryHub, Showcase
(static/tabs/personalized/wishlist/recommended), EventBanner, BannerFull,
QuickFilter, ProductGrid, ProductCard, Breadcrumb, TextSEO, FAQ e RelatedLinks.

**Gate:** Hero e LCP em <= 2.0s no perfil mobile throttled. CLS 0 em todas.

**Entregue:** as 15 sections de conteudo (spec, schema, meta, story e teste cada), `ArtImage`
e helpers compartilhados, autoplay opt-in no `Carousel` e decisoes em
`docs/adr/0015-sections-de-conteudo.md`. JS inicial 138 KB (limite 140; folga de ~2 KB, risco anotado no ADR). Medicao de LCP no
perfil throttled fica para a Fase 6, quando houver pagina real com Hero (o `pnpm lh` ja
cobre a home).

## Fase 6 - Templates e rotas

Entregar: home, collection, pdp, landing, page, search, sitemap HTML e 404.
A home respeita `nears.config.yaml > composition.home.featuredDepartments`
(docs/adr/0006): alem desse numero, departamentos ficam so no nav-drawer e no
mapa do site. Roteamento a partir de `routes.manifest.yaml`, incluindo a regra de canonical entre
o eixo de departamento e o eixo plano de tipo de produto, e a resolucao de URLs
ambiguas por indice de slugs unicos com slugs reservados
(`docs/adr/0003-resolucao-de-rotas-e-robots.md`). Data layer GraphQL com Zod
validando toda resposta e mocks para desenvolvimento.

**Gate:** todo conteudo indexavel presente com JS desabilitado; build falha com
slug duplicado entre fontes ou slug reservado em uso; slug inexistente retorna
status 404.

**Entregue:** data layer tipado com mocks (ADR 0017), resolucao de rotas por indice de slugs
e colecoes/landing/pagina/busca/mapa do site/404 (ADR 0018), e a PDP com as 7 sections
proprias, frete por CEP sem JS, CTA fixo no mobile com `aria-live` e zoom em `<dialog>`
(ADR 0019). JS inicial 139,3 KB (limite 140). Pendencias registradas: header `minimal` na
PDP (Fase 8), canonical/robots por faceta e JSON-LD (Fase 7) e o LCP no perfil throttled
(ver ADR 0020).

Nota: esta fase NAO inclui o mecanismo de resolucao de loja por dominio
personalizado (multi-tenant, ex.: `followin.com.br`) - isso depende da
decisao registrada em `nears.config.yaml > security.multiTenancy.allowlistSource`
(`panel-endpoint`, docs/adr/0016; a implementacao do resolver e desta fase em diante). Rotas aqui assumem
uma loja ja resolvida.

## Fase 7 - SEO e GEO

Entregar: helpers tipados de metadata e JSON-LD por template, geracao de sitemap.xml
segmentado, robots.txt (Disallow por segmento exato, nunca por prefixo solto) e
llms.txt a partir do manifest, alt automatico por regra,
politica de indexacao de facetas, bloco de FAQ por collection e por PDP, e
atribuicao de trafego vindo de motores generativos.

**Gate:** Rich Results sem erro em Product, Breadcrumb, ItemList e FAQPage. `categories:seo` do `lighthouserc.json` volta de `warn` para `error` (o noindex global do layout sai e o robots.txt passa a existir). `contracts.yaml > onMissingGeoField` passa de `warn-build` para `fail-build` no PR final desta fase (docs/adr/0016).

**Entregue:** `apps/web/lib/seo` (metadata, JSON-LD tipado, politica de facetas e paginacao,
robots.txt por segmento exato com politica de agentes, sitemap segmentado, llms.txt e
atribuicao de trafego de IA), `store.organization`/`store.policies` no data layer,
`onMissingGeoField: fail-build`, `categories:seo` em `error` e o `noindex` global removido
(ADR 0021). JS inicial inalterado: todo o codigo novo roda no servidor.

## Fase 8 - Endurecimento

Entregar: carregamento diferido de terceiros com Partytown, RUM de Core Web Vitals,
testes E2E do fluxo descoberta -> PLP -> PDP -> carrinho (rodando em pelo menos
dois presets de nicho), auditoria final de acessibilidade por teclado e leitor de
tela, e documentacao de onboarding para quem for criar uma loja na Nears.
Confira a nota de honestidade em docs/adr/0005 sobre assertions granulares de
`resource-summary` no Lighthouse CI e feche-a se a versao instalada suportar.

**Gate:** Lighthouse mobile >= 90 / >= 95 / 100 nas tres rotas principais;
`pnpm check-budgets` (JS, CSS e HTML por rota, gzip estatico) e as assertions
`resource-summary:*` do Lighthouse CI sem estouro (o Lighthouse 13 nao tem mais a
auditoria `performance-budget`; ver ADR 0005) e `scripts/check-third-party-hosts.mjs` passando.

**Entregue:** quatro PRs. **8a** RUM de Core Web Vitals (coletor inline, `/api/rum`, ADR 0022).
**8b** terceiros declarativos com Partytown, zero por padrao (ADR 0023). **8c** E2E do fluxo
descoberta -> PLP -> PDP -> carrinho em `fashion` e `electronics` com `NEARS_PRESET`, catalogo
mock por nicho e microcopy do carrinho no vocabulary (ADR 0024). **8d** CSP de base, auditoria
de teclado e leitor de tela com o skip link corrigido, onboarding (`docs/ONBOARDING.md`) e plano
de medicao (`docs/MEDICAO.md`) (ADR 0025 e 0026). `performance-budget` saiu do gate (Lighthouse 13
nao o tem); valem `check-budgets` e `resource-summary:*` (ADR 0005). Medido: JS inicial 139,3 KB
de 140, CSS 8 KB de 30, HTML da home 17,8 KB de 80.

**Pendente / fora do escopo do template:** resolver de loja por dominio personalizado
(`security.multiTenancy`, ADR 0016: depende do endpoint de dominios verificados do painel); CSP
com `script-src` (exigiria render dinamico em toda rota, ADR 0025); primeira requisicao a arquivo
inexistente com ponto ainda responde 200 (ADR 0025); Partytown com um terceiro real nunca rodou,
porque nenhum esta habilitado (ADR 0023); conferencia manual com NVDA, JAWS e VoiceOver (ADR 0026).

## Fase 9 - Conta, autenticacao e fulfillment por loja

Entregar: login/cadastro mock (sessao por cookie, no espirito de `/api/cart/items` - nunca
verifica senha real nem substitui um backend de autenticacao), area da conta completa (dados
pessoais, enderecos, historico de pedidos, favoritos) em rotas Server Component proprias (nao
SPA hash-routed), e o contrato de dados/config para lojas sem CD centralizado que cumprem pedido
a partir de loja fisica ("regionalizacao" pedida pelo usuario - nao e selecao de pais/idioma/moeda).
Referencias pesquisadas a pedido do usuario: hering.com.br (estrutura nativa VTEX de conta/login,
replicada so no padrao, nunca em marca/codigo/texto) e rihappy.com.br (retirada em loja em ate 90
minutos / entrega expressa, dirigido por CEP). Vocabulario de fulfillment vem da documentacao
publica da VTEX (Delivery Promise, Pick and Pack). O estoque granular por loja entrou no contrato
como `fulfillment.inventory` e `data.storeInventory` (ADR 0028) - **nao e** o MOI (Multilevel
Omnichannel Inventory) real da VTEX, que e uma configuracao de marketplace multi-seller (qual
seller de nivel 3 vende no marketplace de nivel 1), sem relacao com estoque por loja fisica; a
confusao inicial (atribuida a MOI) foi corrigida na ADR 0028 apos o usuario trazer a doc oficial.

**Gate:** `pnpm validate` verde com os novos contratos/campos de manifest; toda rota de
`/account/**`, `/login` e `/cadastro` com `robots: noindex,nofollow`; 0 violacoes axe nos
formularios de login/cadastro/enderecos; nenhuma senha, token real ou PII sensivel logada ou
armazenada em claro.

Sub-fases (mesmo padrao da Fase 8):

- **9a - Fundacao.** Contratos de dados (`customer`, `order`, `store`), bloco de config
  `fulfillment`, slug `cadastro` reservado, campos `requiresAuth` e `render: "ssr"` no
  schema de rotas, e as duas ADRs de decisao (0027, 0028). Sem UI e sem entradas novas
  em `routes:` ainda - entram em 9b/9c junto do template e das sections que cada rota usa
  (`refs.ts` exige os dois nascerem juntos).
- **9b - Autenticacao mock (concluida).** `/api/account/session` (login/logout) e
  `/api/account/register`, `apps/web/lib/auth/session.ts` (cookie `nears_session`),
  fixture `apps/web/lib/data/customer.ts` (2 clientes mock), paginas `/login` e
  `/cadastro` (rotas reais, `ssg`, `noindex,nofollow`), formulario
  `account-auth-form.tsx` (funciona sem JS). Guard de sessao server-side fica para a
  9c, junto das rotas `/account/**` que ele de fato protege.
- **9c - Area da conta (concluida).** `/account` (visao geral) + `dados`, `enderecos`,
  `pedidos` (lista e detalhe em `/account/pedidos/[orderId]`), `favoritos`; fixtures mock
  de pedido (`apps/web/lib/data/orders.ts`) e favorito (`favorites.ts`) no data layer;
  guard de sessao server-side (`apps/web/lib/auth/guard.ts > requireCustomer`,
  `requiresAuth`, redireciona para `/login?returnUrl=...`). Ver ADR 0027, nota de
  implementacao da 9c, para as decisoes de escopo (somente-leitura, sem contador de
  carrinho/favoritos no header).
- **9d - Fulfillment por loja (concluida).** Fixtures `apps/web/lib/data/stores.ts`
  (`PhysicalStore`) e `store-inventory.ts` (`storeInventory`, ADR 0028 - nao e o MOI
  real da VTEX, ver nota acima); `apps/web/lib/data/pickup.ts` (`quotePickup`)
  calcula retirada/entrega pela loja mais proxima do CEP *com estoque*, aditivo ao
  `quoteShipping` existente - no-op com `fulfillment.mode: centralized` (default);
  nova section `pdp-pickup` na PDP (reusa o `?cep=` de `pdp-shipping`, nunca pede de
  novo); pagina institucional publica `/lojas` (reforca `geo.entity.napConsistency`,
  um `LocalBusiness` por loja). Widget no carrinho fica para quando `/carrinho`
  existir como pagina propria (ver ADR 0028, nota de implementacao da 9d).

## Fase 10 - Carrinho (pagina propria) - concluida

Entregar: carrinho de pagina propria (`/carrinho`), fechando as duas pontas deixadas em aberto
nas Fases 9c e 9d - contador real de carrinho no header/minicart (9c) e o widget de
retirada/entrega por loja pro carrinho inteiro, nao so por produto (9d). Ver ADR 0029.

- Cookie mock `nears_cart` (`apps/web/lib/cart/session.ts`, mesmo padrao de
  `auth/session.ts`): so `{sku, quantity}[]`, HttpOnly, cap de 50 itens/99 por linha -
  nunca guarda preco/nome/estado de compra (CLAUDE.md > Seguranca).
- `/api/cart/items` (Fase 6) passou a persistir de verdade (mescla no cookie, nunca so
  valida); novo `/api/cart/items/update` define quantidade absoluta ou remove
  (`quantity: 0`) - os dois funcionam sem JS.
- `apps/web/lib/data/cart.ts` (`resolveCartLines`/`cartSummary`) junta o cookie com
  `getProducts()` a cada leitura - preco/nome/imagem nunca sao um snapshot do momento
  em que o item foi adicionado; SKU descontinuado e descartado silenciosamente.
  `quoteCartPickup` (aditivo em `pickup.ts`) fecha o widget da 9d: mesma loja mais
  proxima, estoque exigido pra TODOS os SKUs do carrinho (retirada/entrega do carrinho
  inteiro, nunca parcial).
- Contador real no `Header`/`Minicart` globais via duas ilhas dinamicas em `Suspense`
  dentro de `app/layout.tsx` (`getCartAwareChrome` em `storefront.ts`) - mesmo padrao
  "shell estatico + ilha dinamica" de login/cadastro/account/PDP (Cache Components,
  ADR 0007); `getStorefront()` continua 100% estatica, usada por toda rota do site.
  Favoritos/wishlist continuam sem contador real (fora do escopo desta fase).
  Reusa o componente `PdpPickup` (ADR 0028) com seu proprio campo de CEP na pagina.
- Stub de `/checkout` (`render: ssg`, sem Suspense): "checkout" ja estava reservado e
  o CTA "Finalizar compra" sempre apontou pra la sem a rota existir (link morto) - a
  pagina so avisa que o checkout de verdade e do backend/painel, nunca processa ou
  simula pagamento.

**Gate:** `pnpm validate` verde; `/carrinho` e `/checkout` com `robots: noindex,nofollow`;
nenhum dado de pagamento ou preco "congelado" gravado no cookie; zero layout shift no
contador do header (fallback do `Suspense` = mesmo valor estatico de hoje).

**Pendente / fora do escopo desta fase:** contador real de favoritos/wishlist no header
(exigiria sessao de cliente pra todo visitante, inclusive anonimo); checkout/pagamento de
verdade (responsabilidade do backend/painel); carrinho multi-dispositivo (o cookie e por
navegador); cupom; retirada parcial (loja unica por carrinho, nunca split entre lojas).
