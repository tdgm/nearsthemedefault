# ADR 0027 - Autenticacao mock e area da conta (Fase 9a/9b/9c)

- Status: aceito
- Data: 2026-11-06

## Contexto

O template nao tinha estrutura de login nem de "minha conta": os slugs `account` e
`login` ja estavam reservados em `routes.manifest.yaml` desde a Fase 0 (ninguem pode
publicar uma colecao ou pagina institucional com esse nome), mas nenhuma rota real
existia. Pesquisa no HTML publico de hering.com.br confirma o padrao nativo da VTEX:
app de conta SPA roteado por hash (`/account#/orders`) e login via
`/api/io/login?returnUrl=...`. Este repo e frontend puro (CLAUDE.md > Seguranca:
"nunca processa, nunca armazena... credencial"): nao existe backend de autenticacao
aqui, e os gateways/painel que fariam a verificacao real de senha ainda nao existem
no ecossistema Nears. A decisao precisa cobrir dois problemas distintos: (1) como
simular login sem inventar um backend, e (2) qual arquitetura de rotas usar para a
area da conta.

## Decisao

1. **Sessao mock, nao autenticacao real.** `apps/web/app/api/account/session/route.ts`
   segue exatamente o padrao de `apps/web/app/api/cart/items/route.ts`: Zod valida a
   *forma* do corpo (email valido, senha com no minimo 6 caracteres), nunca compara a
   senha a um hash real porque nao existe hash real neste repo. Login mock sucede para
   qualquer email presente no mock de clientes (`apps/web/lib/data/customer.ts`, Fase 9c)
   e falha com `invalid_credentials` para email desconhecido. `POST` grava um cookie
   `nears_session` (httpOnly, Secure, SameSite=Lax, valor = id mock do cliente); `DELETE`
   remove o cookie (logout). Nenhuma senha, token real ou PII sensivel e logada. O
   comentario no arquivo deixa explicito que o cookie **nao e um JWT nem prova
   criptografica de identidade** - e um placeholder de UX ate o backend/painel expor um
   endpoint real de autenticacao, no mesmo espirito de "Gateways de pagamento sao
   responsabilidade do backend/painel" (CLAUDE.md > Seguranca). Cadastro mock
   (`apps/web/app/api/account/register/route.ts`) segue a mesma filosofia: valida forma,
   nunca persiste de verdade (persistencia real e tambem responsabilidade do backend).
2. **Area da conta: rotas Server Component reais, nao SPA hash-routed.** O padrao nativo
   da VTEX (referencia estrutural do projeto, nunca copia de marca ou codigo) usa uma
   SPA client-side roteada por hash. Este template diverge conscientemente: o resto do
   app e Server Components por padrao (CLAUDE.md > Codigo) e paginas de conta sao sempre
   `noindex` (nunca competem com SEO/GEO), entao nao ha ganho em hash-routing e ha perda
   real de streaming/Suspense por secao e de URLs que funcionam com back/forward do
   navegador. Rotas literais (vencem o grupo ambiguo `/[slug]/page` por
   `literalSegmentsFirst`, igual a `/s` e `/b/{keyword}`): `/login`, `/cadastro`,
   `/account` (visao geral), `/account/dados`, `/account/enderecos`,
   `/account/pedidos` (+ `/account/pedidos/[id]`), `/account/favoritos`.
3. **Guard de sessao no servidor.** Toda rota `/account/**` le o cookie `nears_session`
   em Server Component (nunca em client-side) e redireciona para
   `/login?returnUrl=<rota>` quando ausente ou invalido. Isso e declarado no manifest via
   o campo `requiresAuth: true` em cada rota de `routes.manifest.yaml`: o gerador de
   rotas e os testes E2E leem esse campo em vez de adivinhar pelo prefixo `/account`. O
   campo entra no schema (`routes.ts`) ja na Fase 9a; as entradas reais de rota com
   `requiresAuth: true` chegam na 9c, junto do template e das sections que elas usam -
   `refs.ts` falha o build se `route.template` nao existir em
   `sections.registry.yaml > templates`, entao rota e section/template tem que nascer
   juntas.
4. **Escopo completo da area, por decisao explicita do usuario.** Dados pessoais e
   enderecos, historico de pedidos e favoritos/wishlist entram juntos (nao em fases
   separadas), porque sao a mesma superficie de dados do cliente mock e dividi-los so
   adicionaria PRs sem reduzir risco.
5. **Dados mock dedicados.** `apps/web/lib/data/customer.ts` (Fase 9c) segue o mesmo
   contrato do resto do data layer (ADR 0017): fixtures validadas por Zod
   (`customerSchema`, `orderSchema` em `apps/web/lib/data/schemas.ts`), trocaveis por
   GraphQL sem tocar em rotas ou componentes.
6. **Contratos de dados e SEO.** `nears/contracts.yaml > data` ganha `customer` e
   `order` na Fase 9a (so o contrato - fixtures entram na 9c). As entradas de
   `seo.byTemplate` para `login`, `cadastro` e `account` (sempre
   `robots: "noindex,nofollow"` e `schema: []` - dados pessoais nunca sao indexaveis
   nem elegiveis a GEO) so podem existir quando a rota/template correspondente
   existir: `refs.ts > checkContracts` exige que toda chave de `seo.byTemplate` seja
   uma rota ou um template conhecido. Por isso essas tres entradas entram em 9b/9c,
   junto da rota, nao na 9a.

## Pendencias explicitas (fora desta decisao)

- Verificacao real de senha, hashing, recuperacao de senha por e-mail e persistencia
  de cadastro: dependem do backend/painel, que nao existe no ecossistema Nears hoje.
  Quando existir, so o endpoint `/api/account/session` muda de implementacao - o
  contrato (corpo, cookie, redirecionamento) se mantem.
- 2FA, login social e "lembrar-me" nao fazem parte do escopo pedido.

## Nota de implementacao (Fase 9b, 2026-11-06)

Login e cadastro mock implementados: `apps/web/lib/auth/session.ts` (helpers de
cookie em texto puro, sem depender de `next/headers`, para serem testaveis sem
mockar `Request`/`Response` do Next), `apps/web/lib/data/customer.ts`
(`customerSchema`/`addressSchema` + 2 clientes fixos:
`ana.souza@exemplo.com.br` e `bruno.lima@exemplo.com.br`),
`apps/web/app/api/account/session/route.ts` (`POST` login + `DELETE` logout) e
`apps/web/app/api/account/register/route.ts` (`POST` cadastro), consumidos por
`apps/web/components/account-auth-form.tsx` (client component, mesmo padrao de
`add-to-cart-form.tsx`) nas paginas `apps/web/app/login/page.tsx` e
`apps/web/app/cadastro/page.tsx`. Dois ajustes em relacao ao esboco original
desta ADR:

- **Senha do login sem minimo de caracteres** (so `min(1)`, nao os "6
  caracteres" citados acima): o login mock nunca verifica a senha de verdade,
  entao exigir um tamanho minimo so fingiria uma regra de seguranca que nao
  existe. O cadastro mock mantem `min(8)` (com `confirmarSenha` igual a
  `senha` via `.refine`) como piso razoavel de UX, ja que e o unico momento em
  que a pessoa escolhe a propria senha.
- **Nenhuma section nova em `packages/sections`.** O formulario virou um
  componente simples em `apps/web/components/` (como `search-form.tsx`),
  nao uma section do registry: login/cadastro sao paginas utilitarias fora do
  fluxo de merchandising, mesma categoria do template `search`, que ja toma
  essa liberdade. `nears/sections.registry.yaml > templates.login/cadastro`
  so referenciam `section-title` (existente) para satisfazer
  `refs.ts > checkTemplates/checkRoutes`.
- **`render: ssr`, nao `ssg` (ajuste pos-build).** `/login` e `/cadastro` leem
  `searchParams` (`returnUrl`/`erro`) a cada requisicao - com *Cache
  Components* do Next 16, isso teria que ficar dentro de `<Suspense>`, senao
  `pnpm build` falha ao tentar prerenderizar a rota ("uncached or runtime data
  during prerendering"). Cada pagina virou shell estatico (`<h1>` + rotulos do
  `vocab`) com uma ilha async dentro de `<Suspense>` lendo `searchParams`,
  mesmo padrao de `app/s/page.tsx` (comentario la: "searchParams e dado de
  requisicao: com cacheComponents precisa ficar dentro de Suspense"). Por
  isso `routes.manifest.yaml` usa `render: ssr`, nao `ssg` como no primeiro
  commit desta sub-fase.

As entradas reais de rota (`login`, `cadastro`, `ssr`, `noindex,nofollow`) e de
`contracts.yaml > seo.byTemplate` ja existem a partir desta sub-fase. `account`
e suas sub-rotas (dados/enderecos/pedidos/favoritos, `requiresAuth: true`,
`render: ssr`) continuam fora do escopo, para a Fase 9c.

## Nota de implementacao (Fase 9c, 2026-11-06)

Area da conta implementada: 6 rotas (`/account`, `/account/dados`,
`/account/enderecos`, `/account/pedidos`, `/account/pedidos/[orderId]`,
`/account/favoritos`), todas `render: ssr`, `requiresAuth: true`,
`indexable: false`. Guard em `apps/web/lib/auth/guard.ts > requireCustomer`
(nao em `apps/web/lib/data/schemas.ts` como o esboco original desta ADR
citava - `customerSchema`/`addressSchema` ja tinham ficado em
`apps/web/lib/data/customer.ts` desde a 9b; os novos `orderSchema`
(`orders.ts`) e `favoriteSchema` (`favorites.ts`) seguem o mesmo arquivo por
entidade). Decisoes de escopo, nenhuma pedida explicitamente mas necessarias
para fechar a sub-fase sem inventar comportamento:

- **Tudo somente-leitura.** `/account/dados` e `/account/enderecos` exibem os
  dados do cliente mock, sem formulario de edicao - nao existe persistencia
  real neste repo (CLAUDE.md > Seguranca), e o ROADMAP pediu "fixture +
  pagina", nunca "edicao". `/account/favoritos` tambem nao tem botao de
  remover: um toggle que nao persiste de verdade (mesmo padrao de
  `/api/cart/items`) criaria uma lista que "volta" ao recarregar a pagina -
  pior UX do que simplesmente nao oferecer a acao nesta sub-fase.
- **Pedido pertence ao cliente, sempre verificado.** `findOrderByIdForCustomer`
  so retorna o pedido quando `customerId` bate; a pagina de detalhe chama
  `notFound()` tanto para pedido inexistente quanto para pedido de outro
  cliente, sem distinguir a resposta (evita confirmar que um id alheio
  existe so pelo tempo/forma da resposta).
- **`cartCount`/`wishlistCount` do header continuam sem wiring.** Ja eram
  props estaticas (`default: 0`) antes desta sub-fase, sem nenhuma leitura
  de estado real em lugar nenhum do app (nem o carrinho, que e mais antigo,
  tem). Teria sido inconsistente wire-ar so o contador de favoritos agora;
  fica para quando o carrinho ganhar estado de verdade.
- **Logout ganhou um segundo endpoint.** `DELETE /api/account/session`
  (9b) so serve fetch/JS - HTML nao tem metodo DELETE. O botao "Sair" da
  visao geral e um `<form method="POST">` comum, entao chama
  `POST /api/account/session/logout` (novo nesta sub-fase).
- **Shell estatico + Suspense, nunca `instant: false`.** As 6 paginas seguem
  exatamente o padrao de `/login`/`/cadastro`: `<h1>` fora do Suspense,
  `requireCustomer` (le `cookies()`) dentro. `instant: false` (Next 16,
  Cache Components) existe para adocao incremental de app ja existente -
  destrava o build sem resolver o aviso, nao e a forma correta de modelar
  uma rota sem shell estatico que se tem a chance de fazer certo desde o
  primeiro commit.
- **`testTimeout` global subiu de 5s (default) para 15s em
  `vitest.config.ts`, achado durante a validacao desta sub-fase, nao causado
  por ela.** `apps/web/tests/home.test.tsx`, `pdp.test.tsx` e `seo.test.ts`
  renderizam o template inteiro (todas as sections da home/PDP) ou iteram o
  catalogo de 24 produtos inteiro em jsdom; isolados, sem nenhuma contencao,
  ja levam 4.5-4.8s - confirmado rodando-os sozinhos na `main`, sem nenhuma
  mudanca desta fase. Sob a carga normal de `pnpm validate` (lint, typecheck
  e build concorrentes antes do estagio de testes), isso virava timeout
  intermitente em `apps/web/tests/known-path.test.ts` tambem (que esta fase
  tocou, adicionando 3 paths a um loop existente) e em qualquer um dos tres
  testes pesados acima, trocando de teste a cada corrida - sintoma de
  ambiente, nunca o mesmo assert falhando. `pool: 'vmThreads'`/`isolate:
  false` (sugestao do proprio vitest, ver resumo do `pnpm test`) resolveria
  de forma mais estrutural, mas muda como os testes isolam entre si; a troca
  conservadora e so dar mais tempo de parede a testes legitimamente lentos,
  sem tocar isolamento. Fica registrado aqui por ter sido descoberto durante
  a Fase 9c, nao por ser escopo dela.

## Consequencias

- `account`, `login` seguem reservados em `resolution.reserved.firstSegment`;
  `cadastro` entra na mesma lista e em `excluded.disallowSegments` (nao estava
  reservado antes porque a rota nao existia).
- Nenhum componente de UI, pagina, rota no manifest ou teste E2E e criado nesta
  sub-fase (9a): so o contrato de dados/SEO (`contracts.yaml`) e os campos
  `requiresAuth` e `render: "ssr"` no *schema* de rotas
  (`packages/manifests/src/schemas/routes.ts`), ainda sem nenhuma rota usando-os. A
  implementacao de `/api/account/*`, das paginas e das entradas em
  `routes.manifest.yaml` entra em 9b (login/cadastro) e 9c (area da conta), junto dos
  templates/sections que `refs.ts` exige existirem.
