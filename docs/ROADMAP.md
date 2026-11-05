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

## Fase 8 - Endurecimento

Entregar: carregamento diferido de terceiros com Partytown, RUM de Core Web Vitals,
testes E2E do fluxo descoberta -> PLP -> PDP -> carrinho (rodando em pelo menos
dois presets de nicho), auditoria final de acessibilidade por teclado e leitor de
tela, e documentacao de onboarding para quem for criar uma loja na Nears.
Confira a nota de honestidade em docs/adr/0005 sobre assertions granulares de
`resource-summary` no Lighthouse CI e feche-a se a versao instalada suportar.

**Gate:** Lighthouse mobile >= 90 / >= 95 / 100 nas tres rotas principais;
`performance-budget` com score 1 (nenhum budget de `settings.budgets` estourado)
e `scripts/check-third-party-hosts.mjs` passando.
