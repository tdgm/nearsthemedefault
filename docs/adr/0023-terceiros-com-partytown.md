# ADR 0023 - Scripts de terceiros: Partytown, loader tardio e zero por padrão

Status: aceita (Fase 8)

## Contexto

`CLAUDE.md` proíbe script de terceiro que bloqueie render e exige `afterInteractive`,
`lazyOnload` ou Partytown, cada um com ADR. `nears.config.yaml > integrations` já fixa
`thirdPartyPolicy: { sandbox: partytown, requiresAdr: true }`, mas nada o executava:
não havia como uma loja declarar um terceiro, e nada impedia um script de entrar sem ADR
ou de estourar `budgets.third_party_hosts` (8) e `third_party_js_kb` (80).

## Decisão

1. **Zero por padrão.** `nears.config.yaml > thirdParties.scripts: []`. Sem itens, o
   `ThirdPartyScripts` devolve `null`: nenhum byte de HTML, nenhuma requisição, nenhum host.
   Os gates de Lighthouse (`resource-summary:third-party:size`) e
   `check-third-party-hosts.mjs` continuam medindo o piso real.
2. **Cada terceiro é um item declarativo**, validado por Zod:
   `{ id, integration, src (https), strategy, forward?, adr, mainThreadReason? }`.
   O manifest **falha no carregamento** se: o `adr` apontado não existir em `docs/adr/`,
   houver `id` repetido, a loja passar de `budgets.third_party_hosts` hosts distintos, ou um
   script fora do worker não trouxer `mainThreadReason`. É o enforcement de "todo terceiro
   precisa de ADR" que antes era só texto.
3. **Estratégias.**
   - `partytown` (padrão): vira `<script type="text/partytown">`, que o navegador **não
     executa**; o Partytown busca e roda o script num web worker. `forward` lista as chamadas
     globais que a página faz ao script (ex.: `dataLayer.push`). O snippet inline
     (`partytownSnippet`, ~2,5 KB) só é emitido se houver ao menos um script em worker.
   - `idle`: loader inline ES5 injeta `<script async>` em `requestIdleCallback` (timeout 4 s,
     `setTimeout` 2 s sem suporte) **depois do `load`**.
   - `post-interaction`: o mesmo loader injeta na primeira interação (`pointerdown`, `keydown`,
     `scroll`, `touchstart`), uma vez. Sem interação, nunca carrega (analytics aceita isso;
     `integrations.analytics.loadStrategy: post-interaction`).
   Os dois últimos rodam na thread principal e exigem `mainThreadReason` (ex.: o widget
   precisa tocar o DOM, o que o Partytown só emula).
4. **Dependência nova: `@builder.io/partytown@0.10.3`** (MIT). Peso medido: `pnpm audit
   --audit-level=high` limpo, lockfile +11 linhas (nenhuma dependência transitiva), 394 KB
   desempacotado no registry. O que chega ao cliente é só `lib/` de produção, e só quando
   há terceiro em worker: `partytown.js` 1,3 KB gzip (thread principal), service worker
   14 KB, atomics 13,6 KB, media 2 KB (rodam no worker; ~31 KB gzip no total, contra o
   orçamento de 80 KB de JS de terceiros). A pasta `debug/` nunca é publicada.
   Não entra no bundle: `partytownSnippet` roda no servidor.
5. **Arquivos de `lib/`** são gerados (`pnpm --filter web partytown:copy`, chamado por
   `predev` e `prebuild`) em `apps/web/public/~partytown/` e ignorados pelo git, para não
   versionar 90 KB de código de terceiro que muda a cada versão. O pacote não publica tipos
   para `/integration`; `apps/web/types/partytown-integration.d.ts` declara só o que usamos.

## Alternativas descartadas

- `next/script` com `afterInteractive`/`lazyOnload`: roda na thread principal e conta no INP;
  vira a estratégia `idle` apenas com justificativa.
- `@next/third-parties`: dependência adicional por fornecedor, trata GTM/GA como caso
  especial e mantém tudo na thread principal.
- Não oferecer nada e deixar a loja editar o layout: sem ADR, sem limite de hosts, sem teste.

## Limites conhecidos (ditos, não escondidos)

- O Partytown intercepta APIs de DOM no worker; scripts que dependem de síncrono real
  (alguns widgets de chat e A/B com anti-flicker) podem falhar: use `idle` com
  `mainThreadReason`. Vale testar cada terceiro em worker antes de aprovar o ADR da loja.
- Scripts cross-origin no worker precisam de CORS ou de `resolveUrl` (proxy reverso); o
  template não traz proxy. Se o terceiro não envia CORS, a loja decide no ADR dela.
- Este repo não tem terceiro real habilitado, então o teste automatizado cobre o HTML, o
  loader e as regras do manifest, e o E2E garante **zero** requisições de terceiros por
  padrão. Rodar o worker de verdade acontece na primeira loja que declarar um.
- Sem CSP de `script-src`, o snippet e o loader inline funcionam; com CSP por hash (8d) o
  texto de ambos é determinístico e pode ser liberado pelo hash.

## Consequências

- Nenhuma mudança de orçamento: JS 139,3 KB, CSS 8 KB, HTML 17,8 KB na configuração padrão.
- Adicionar um terceiro é editar o manifest e escrever um ADR; o CI recusa o resto.
