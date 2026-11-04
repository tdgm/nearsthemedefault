# Roadmap de implementacao

Oito fases. Cada uma tem entregavel e gate. Nao avance com gate vermelho.

## Fase 0 - Fundacao

Entregar: monorepo pnpm, Next 15 App Router, TS strict, ESLint/Prettier, Vitest,
Playwright, Storybook, Lighthouse CI, GitHub Actions. O script `pnpm validate` ja
deve falhar corretamente ao estourar budget - teste com um import gigante
proposital e depois remova.

**Gate:** CI verde em repo vazio.

## Fase 1 - Tokens

Entregar: `packages/tokens/tokens.json` com escalas completas (neutral 0-1000,
brand, accent, semanticos), tipografia fluida com clamp, espaco base 4, radii,
shadows, z-index, breakpoints 360/768/1024/1280/1536 e motion. Build Style
Dictionary gerando CSS vars + preset Tailwind + JSON para Figma. Tema claro e
escuro. Troca de marca por substituicao de um unico arquivo.

**Gate:** contraste AA validado por teste automatizado em todos os pares semanticos.

## Fase 2 - Manifests e registry

Entregar: os quatro YAML em `/nears` com schemas Zod, loader tipado, geracao de
tipos a partir dos manifests, e um section registry que falha o build se uma
section nao declarar `priority`, `cwv` e `a11y`.

**Gate:** `pnpm validate` valida os manifests e gera os tipos.

## Fase 3 - Design system (packages/ui)

Entregar: Button, IconButton, Link, Input, Select, Checkbox, Radio, RadioGroup,
Swatch, SizeSelector, Badge, Price, Rating, Skeleton, Toast, Tooltip, Accordion,
Tabs, Modal, Drawer, Breadcrumb, Pagination, Carousel (scroll-snap nativo) e Image
(wrapper com picture + aspect-ratio obrigatorio).

**Gate:** 100% com story, teste e axe limpo. Bundle do pacote <= 25 KB gzip.

## Fase 4 - Sections globais

Entregar: PromoBar com countdown (altura reservada, CLS zero), Header com variantes
full/minimal/none por padrao de rota, NavDrawer multi-eixo carregado so na
interacao, Minicart, Footer com colunas colapsaveis e CustomerService.

**Gate:** JS inicial ainda <= 120 KB com header e footer montados.

## Fase 5 - Sections de conteudo

Entregar: Hero, BenefitBar, SectionTitle, BannerGrid, CategoryHub, Showcase
(static/tabs/personalized/wishlist/recommended), EventBanner, BannerFull,
QuickFilter, ProductGrid, ProductCard, Breadcrumb, TextSEO, FAQ e RelatedLinks.

**Gate:** Hero e LCP em <= 2.0s no perfil mobile throttled. CLS 0 em todas.

## Fase 6 - Templates e rotas

Entregar: home, collection, pdp, landing, page, search, sitemap HTML e 404.
Roteamento a partir de `routes.manifest.yaml`, incluindo a regra de canonical entre
o eixo de departamento e o eixo plano de tipo de peca. Data layer GraphQL com Zod
validando toda resposta e mocks para desenvolvimento.

**Gate:** todo conteudo indexavel presente com JS desabilitado.

## Fase 7 - SEO e GEO

Entregar: helpers tipados de metadata e JSON-LD por template, geracao de sitemap.xml
segmentado, robots.txt e llms.txt a partir do manifest, alt automatico por regra,
politica de indexacao de facetas, bloco de FAQ por collection e por PDP, e
atribuicao de trafego vindo de motores generativos.

**Gate:** Rich Results sem erro em Product, Breadcrumb, ItemList e FAQPage.

## Fase 8 - Endurecimento

Entregar: carregamento diferido de terceiros com Partytown, RUM de Core Web Vitals,
testes E2E do fluxo descoberta -> PLP -> PDP -> sacola, auditoria final de
acessibilidade por teclado e leitor de tela, e documentacao de onboarding para quem
for criar uma loja na Nears.

**Gate:** Lighthouse mobile >= 90 / >= 95 / 100 nas tres rotas principais.
