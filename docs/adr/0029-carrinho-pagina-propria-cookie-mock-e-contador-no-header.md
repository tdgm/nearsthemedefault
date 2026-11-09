# ADR 0029 - Carrinho (pagina propria): cookie mock, contador real no header e widget de retirada/entrega

- Status: aceito
- Data: 2026-11-06

## Contexto

A Fase 9 terminou com tres pontas deixadas deliberadamente em aberto, todas
pelo mesmo motivo - nao havia ainda um carrinho de pagina propria pra
sustenta-las:

1. **ADR 0027 (Fase 9c)**: a area da conta nao tem "contador de
   carrinho/favoritos no header" - o `Header`/`Minicart` globais em
   `apps/web/lib/storefront.ts` sempre recebem `cartCount: 0`/`items: []`
   hardcoded, mesmo com `add-to-cart-form.tsx` (Fase 6) ja postando de
   verdade pra `/api/cart/items` (que hoje so valida e devolve 200/303, sem
   persistir nada - mock puro, comentado como tal no proprio arquivo).
2. **ADR 0028 (Fase 9d)**: o widget de retirada/entrega por loja
   (`quotePickup`/`pdp-pickup`) so existe na PDP (um produto, um CEP) e na
   pagina `/lojas`. A ADR 0028 ja registra explicitamente (secao "Fora do
   escopo desta entrega, ainda") que o carrinho ficaria pra depois,
   "quando o carrinho de pagina propria existir".
3. `routes.manifest.yaml` ja reserva `carrinho` e `checkout` desde a Fase
   9a (`resolution.reserved.firstSegment`), mas nenhuma das duas rotas
   existe de verdade.

Com a Fase 9 (9a-9d) mergeada e o `docs/ROADMAP.md` sem nenhuma fase
seguinte escrita, esta ADR abre a Fase 10 pra fechar as tres pontas acima
numa unica entrega coerente, usando o mesmo vocabulario arquitetural ja
estabelecido (sessao mock em cookie, pagina com ilha dinamica em
`Suspense`).

Este repo e frontend puro (CLAUDE.md > Seguranca): carrinho real e
checkout/pagamento sao responsabilidade do backend/painel. O carrinho
desta fase nunca guarda preco, nome ou qualquer dado de pagamento - so
`{sku, quantity}`, resolvido contra o catalogo a cada leitura.

## Decisao

### 1. Cookie mock `nears_cart`

Mesmo padrao de `apps/web/lib/auth/session.ts` (ADR 0027): helpers em texto
puro, sem depender de `next/headers`, pra serem testaveis sem mockar
Request/Response. Novo modulo `apps/web/lib/cart/session.ts`, nao reusa
`cookieAttrs` de `session.ts` (funcao privada, nao exportada) - duplica as
~4 linhas de atributos em vez de criar um util compartilhado so pra isso;
decisao conservadora de simplicidade, nao uma dependencia nova.

- Nome: `nears_cart`. Valor: JSON `{sku: string, quantity: number}[]`,
  **HttpOnly** (carrinho so e lido/escrito no servidor - nenhuma ilha
  client-side le o cookie direto nesta fase, ver secao 3), `SameSite=Lax`,
  `Secure` so em produgao (mesmo motivo do `session.ts`: em `pnpm dev` HTTP
  descartaria o cookie), `Max-Age` de 30 dias.
- Cap de 50 linhas e quantidade 1-99 por linha (`Zod`) - bound do tamanho
  do cookie (limite de ~4KB do navegador) e mesmo teto de quantidade que
  `add-to-cart-form.tsx`/`/api/cart/items` ja usam.
- Cookie corrompido, SKU que nao existe mais no catalogo, ou entrada fora
  do cap: descartado silenciosamente ao decodificar - nunca quebra a
  pagina nem lanca erro pro visitante (mesmo espirito de
  `decodeSessionCustomerId`).
- Nunca guarda preco/nome/imagem - isso e sempre resolvido contra
  `getProducts()` na leitura (`apps/web/lib/data/cart.ts`), pra nunca
  divergir do catalogo (um produto que mudou de preco reflete o preco
  atual, nao o preco de quando foi adicionado - mock aceita essa
  simplificacao; checkout de verdade e do backend).

### 2. `/api/cart/items` passa a persistir; novo `/api/cart/items/update`

`/api/cart/items` (existente, Fase 6) e o endpoint que
`add-to-cart-form.tsx` ja chama. Hoje ele so valida e devolve
200 JSON/303 redirect sem guardar nada. Fica **aditivo**: mesmo contrato de
request/response, mas agora le o cookie atual, soma a quantidade (ou cria a
linha) e devolve com `Set-Cookie`. O redirect 303 do caminho sem JS trocou
de `Response.redirect()` pra uma `Response` construida a mao (mesmo motivo
documentado em `/api/account/session/route.ts`: `Response.redirect()`
devolve headers imutaveis nesse runtime, e anexar `Set-Cookie` precisa de
headers mutaveis).

Novo `/api/cart/items/update`: `POST {sku, quantity}` define quantidade
absoluta (`quantity=0` remove a linha). Mesmo padrao dual JSON/form+303 dos
outros endpoints - funciona sem JS (cada linha do carrinho e um `<form>`
separado).

### 3. Contador real no header/minicart: ilha dinamica em `Suspense`, nao leitura client-side

Alternativas consideradas pra alimentar `cartCount`/`items` reais no
`Header`/`Minicart` globais (renderizados uma vez em `app/layout.tsx`, que
envolve TODA rota do site):

- **(A) Ler `cookies()` direto em `getStorefront()`/`RootLayout`, sem
  isolar em `Suspense`.** Com `cacheComponents: true` (ADR 0007) isso nao e
  so lento - **quebra o build**: o modelo de Cache Components do Next 16
  exige que todo dado dinamico (cookie, `searchParams`) esteja dentro de um
  `Suspense` pra a rota continuar prerenderizavel. Fora de um `Suspense`, o
  build falha. Rejeitada.
- **(B) Cookie nao-`HttpOnly`, lido por JS no cliente** (contador calculado
  no browser, sem nenhuma leitura server-side). Evitaria qualquer mudanca
  de rendering, mas abriria mao do `HttpOnly` sem necessidade real (nenhum
  outro script de pagina precisa ler esse cookie) e duplicaria a logica de
  parse em JS do cliente. Rejeitada.
- **(C) Ilha dinamica em `Suspense` dentro do proprio `app/layout.tsx`**,
  envolvendo so `Header`+`Minicart`, lendo `cookies()` do lado do servidor
  - exatamente o padrao ja usado em `app/login/page.tsx`/
  `app/account/**`/`apps/web/lib/templates/pdp.tsx` ("shell estatico fora,
  ilha dinamica dentro"), so que aplicado dentro do layout global em vez de
  uma pagina. **Escolhida.**

Com (C): `PromoBar`, `Footer`, `NavDrawer`, `CustomerService` continuam
exatamente como estao hoje - nenhuma mudanca de rendering pras outras
sections globais, e nenhuma rota que hoje e `ssg`/`isr` passa a ser `ssr`.
So o fragmento `Header`+`Minicart` (que ja carrega so HTML/CSS - nenhum dos
dois tem JS de bundle critico, por serem Server Components) ganha uma
borda de streaming. O fallback do `Suspense` e o mesmo render estatico de
hoje (`cartCount: 0`, `items: []`) - zero layout shift, mesmo padrao de
`DynamicFulfillment` em `pdp.tsx`.

Consequencia aceita: **toda rota do site passa a ter uma borda dinamica**
(a ilha do carrinho), mesmo quem antes era 100% estatico. Isso nao torna a
rota inteira dinamica (o objetivo inteiro do Cache Components e isolar
esse custo na borda), mas e uma mudanca de topologia que vale registrar -
se o custo de streaming dessa borda em toda pagina se mostrar alto em
produgao real (RUM, `docs/ROADMAP.md > plano de medicao`), a proxima opcao
e (B) com um endpoint `/api/cart/count` leve.

### 4. `quoteCartPickup`: retirada/entrega pra varios SKUs

Aditivo sobre `quotePickup` (`apps/web/lib/data/pickup.ts`), mesma
assinatura de ideias: acha a loja mais proxima do CEP
(`findNearestStore`), mas a condicao de estoque passa a exigir
`hasStockAtStore(store.id, sku)` pra **todos** os SKUs do carrinho (nao so
um) - "retire/receba o carrinho inteiro numa unica loja", nao uma
selecao item a item. Se nenhuma loja unica atender 100% do
carrinho, cai no mesmo erro generico que `quotePickup` ja devolve ("Não há
retirada nem entrega por loja disponível para este CEP."); nao existe
"retirada parcial" nesta fase - simplificacao documentada, nao bug.

### 5. `/carrinho`: pagina real, SSR

Mesmo padrao de `/account/**` (ADR 0027): le o cookie a cada requisicao,
`render: ssr` (nunca `isr`/`ssg` - carrinho e por visitante), shell
estatico (titulo) + ilha em `Suspense` que resolve as linhas, mostra
quantidade (formulario por linha, funciona sem JS), remogao, subtotal
(`/lib/format`), e o widget de retirada/entrega reusando o componente
`PdpPickup` (`@nears/sections`) com `quoteCartPickup`. Nunca indexavel
(`noindex,nofollow`, mesmo motivo de login/account - dado por visitante,
nunca conteudo de catalogo). `carrinho` ja estava reservado desde a 9a.

### 6. `/checkout`: stub, nao fluxo real

`checkout` tambem ja estava reservado desde a 9a, e o CTA "Finalizar
compra" do minicart/carrinho ja apontava pra `/checkout` (default de
`checkoutHref` no schema do minicart) - sem a rota existir, esse link
sempre foi um 404 morto. Em vez de deixar o link quebrado ou desabilita-lo
sem explicagao, esta fase cria um stub estatico (`render: ssg`, sem
Suspense - nenhum dado dinamico) avisando que o checkout de verdade e
responsabilidade do backend/painel (CLAUDE.md > Seguranca), com link de
volta pro carrinho. Nao e um checkout funcional, nao processa nem simula
pagamento - e so a pagina parar de ser um link morto.

## Consequencias

- `Header` e `Minicart` nao sao vizinhos no layout (o header fica antes de
  `#conteudo`; o minicart, depois do `NavDrawer`) - em vez de uma ilha unica
  cobrindo os dois, cada um ganha seu PROPRIO `<Suspense>` e sua propria
  chamada a `getCartAwareChrome()`. As duas chamadas leem o mesmo cookie e
  recalculam a mesma resolucao - aceitavel porque `getProducts()` ja cacheia
  o snapshot em memoria (`apps/web/lib/data/client.ts`), entao a segunda
  chamada e so re-filtrar um array ja carregado, nao uma segunda leitura de
  "banco". Nao introduz `React.cache()`/memoizacao nova so pra isso.
- Favoritos/wishlist continuam SEM contador real (`wishlistCount` nao e
  passado, fica no default `0` do `Header`) - a Fase 9c deferiu "contador de
  carrinho/favoritos" junto; esta fase fecha so a metade do carrinho.
  Favoritos exigiria sessao de cliente (`requireCustomer`) pra todo
  visitante, inclusive anonimo, o que e uma mudanca de modelo maior; fica
  pra uma fase futura se for priorizado.
- Vocabulary (`nears/nears.config.yaml`) ganha as chaves novas da pagina de
  carrinho/stub de checkout, todas obrigatorias em
  `REQUIRED_VOCABULARY_KEYS` (`packages/manifests/src/schemas/config.ts`)
  - qualquer preset futuro pode trocar o texto, nunca remover a chave.
- `nears.types.ts` precisa ser regenerado (`pnpm manifests:types`) depois
  dos manifests mudarem.
- Toda rota do site ganha uma borda `Suspense` adicional (o contador do
  header) - ver secao 3 "Consequencia aceita" acima; medir o impacto real
  faz parte do plano de medicao do ROADMAP quando houver RUM de producao.
- O carrinho resolvido na pagina `/carrinho` e no header/minicart sempre
  reflete o catalogo atual (preco/nome/imagem no momento da leitura, nunca
  um snapshot do momento em que o item foi adicionado) - aceitavel pra um
  mock; um backend real teria essa decisao explicita no checkout.
- Continua fora do escopo: checkout/pagamento de verdade, carrinho
  multi-dispositivo/multi-sessao (o cookie e por navegador), cupom, frete
  por CEP no carrinho em si (a pagina reusa o CEP via `?cep=` igual a PDP,
  nao duplica o campo).

## Addendum: `Suspense` no `Header` inteiro quebrava o "Menu" por teclado

A primeira versao desta fase envolvia o `Header` INTEIRO (nao so o botao de
carrinho) num unico `<Suspense>` no layout raiz (`CartAwareHeader`). O E2E
`e2e/keyboard.spec.ts:67` (`"Menu" abre com Enter, prende o foco...`) passava
limpo em `main` e falhou de forma deterministica (2/2 tentativas, identico)
no CI da PR depois dessa mudanca - so o caso `/` ("Menu"); o caso
`/departamento-exemplo` ("Filtrar", que nao tem nada a ver com carrinho/Header)
continuou passando, o que ja apontava pra algo especifico do `Header`.

Causa raiz: com Cache Components, o `Suspense` em volta do `Header` faz o
Next fazer *streaming* do HTML - a pagina chega primeiro com o fallback
estatico, e o conteudo resolvido (com `cartCount` real) substitui aquele
subtree inteiro do DOM quando a leitura do cookie termina, **mesmo quando o
valor resultante e identico ao fallback** (carrinho vazio). O teste faz
`button.focus()` seguido de `page.keyboard.press('Enter')`
(`OverlayTrigger`, `packages/ui/src/overlay/overlay-trigger.tsx`, usa
`document.getElementById(targetId)` no `onClick` - nao e um ref obsoleto).
O problema e outro: se a troca do subtree acontecer entre o `focus()` e o
`Enter`, o navegador remove o elemento focado e o foco cai pra `<body>`;
`Enter` so ativa `click()` num botao que esta focado, entao nada abre o
`NavDrawer`. O botao "Menu" nao depende do carrinho em nada - ele so estava
dentro do MESMO subtree React que o botao de carrinho, que de fato precisa
ser dinamico.

Fix: o `Header` ganhou um prop `cartTrigger?: ReactNode` (fora do schema Zod
- e composicao de React, nunca dado de CMS) que, quando presente, substitui
o botao de carrinho interno (`CartButton`, agora exportado de
`@nears/sections`). O layout raiz para de envolver o `Header` inteiro em
`Suspense`: ele renderiza `<Header>` direto (100% estatico, igual a antes da
Fase 10) e constroi so o `cartTrigger` como
`<Suspense fallback={<CartButton .../>}><CartButtonLive /></Suspense>` -
uma ilha dinamica do tamanho de UM botao, nunca do Header inteiro. O "Menu"
nunca mais troca de DOM; so o botao de carrinho (que precisa mesmo refletir
a contagem real no `aria-label`) continua sujeito ao mesmo streaming -
nenhum teste hoje faz foco+Enter nele, mas o risco e o mesmo caso um dia
exista um; vale a pena ter em mente se for escrito.

O `Minicart` (o `<dialog>` que esse botao abre) continua inteiro dentro de
`Suspense` (`CartAwareMinicart`) - nao ha teste de teclado abrindo o
minicart hoje (o fluxo testado usa `.click()`, que o Playwright reavalia
contra o DOM atual, sem depender de foco persistido entao nao sofre do
mesmo bug), entao nao foi alterado. Fica documentado como risco aceito
igual ao botao de carrinho, nao como um bug corrigido.
