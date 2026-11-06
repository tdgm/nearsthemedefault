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
   `order` (Fase 9a, so o contrato - fixtures entram na 9c). `seo.byTemplate` marca
   `login`, `cadastro` e `account` como `robots: "noindex,nofollow"` e `schema: []`:
   dados pessoais nunca sao indexaveis nem elegiveis a GEO (nao faz sentido um motor
   generativo citar o pedido de alguem).

## Pendencias explicitas (fora desta decisao)

- Verificacao real de senha, hashing, recuperacao de senha por e-mail e persistencia
  de cadastro: dependem do backend/painel, que nao existe no ecossistema Nears hoje.
  Quando existir, so o endpoint `/api/account/session` muda de implementacao - o
  contrato (corpo, cookie, redirecionamento) se mantem.
- 2FA, login social e "lembrar-me" nao fazem parte do escopo pedido.

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
