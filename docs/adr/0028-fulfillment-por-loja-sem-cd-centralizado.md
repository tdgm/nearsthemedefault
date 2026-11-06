# ADR 0028 - Fulfillment por loja, sem CD centralizado ("regionalizacao") (Fase 9a/9d)

- Status: aceito
- Data: 2026-11-06

## Contexto

O termo "regionalizacao" foi pedido pelo usuario e inicialmente interpretado por mim
como seletor de pais/moeda/idioma - interpretacao incorreta, corrigida pelo proprio
usuario. O significado real: cobrir o cenario de lojas Nears que **nao tem centro de
distribuicao centralizado** e cumprem pedidos exclusivamente a partir das proprias
lojas fisicas (ship-from-store). `apps/web/lib/data/shipping.ts` ja existe e cobre o
modelo de CD centralizado (cotacao por CEP com prazo calculado pela regiao do CEP);
esta decisao e aditiva sobre ele, nao uma substituicao.

Pesquisa feita a pedido do usuario:
- **rihappy.com.br**: padrao real observado (HTML publico) - "Retirada na loja em ate
  90 minutos" e "Entrega Expressa" dirigidos por CEP, com pagina dedicada
  `/retira-em-loja`. A loja mais proxima do CEP informado determina o prazo.
- **Documentacao VTEX**: "Delivery Promise" (disponibilidade/prazo calculado por
  localizacao, pode incluir retirada), modelo de Fulfillment (warehouse -> loading
  dock -> shipping policy -> SLA; canais de delivery vs pickup) e VTEX Pick and Pack
  (cumprimento de pedido a partir da propria loja, sem CD, com app de picker). Esses
  tres conceitos sao a base vocabular desta decisao.
- **"MOI"**: citado pelo usuario como termo a pesquisar na VTEX. Nao foi possivel
  confirmar como termo real da documentacao publica da VTEX em nenhuma busca
  realizada. Registrado aqui como **pendente de esclarecimento com o usuario** -
  nenhum campo ou conceito desta ADR usa essa sigla. Se o usuario confirmar o
  significado, uma ADR de extensao trata disso; nao adivinho o significado para nao
  arriscar nomear um campo de manifest errado.

## Decisao

1. **Novo bloco `fulfillment` em `nears.config.yaml`, fora de `catalog`/`vocabulary`.**
   Nao e conceito de nicho (CLAUDE.md: "Nenhum conceito de nicho hardcoded... se algo
   muda por nicho, vira campo explicito") - e um conceito de modelo operacional da
   loja, ortogonal ao nicho de varejo (uma loja de moda e uma de eletronicos podem
   igualmente nao ter CD). Forma (Fase 9a, so o contrato):
   ```yaml
   fulfillment:
     mode: centralized   # centralized | ship-from-store | hybrid
     pickup:
       enabled: false
       label: "Retirar na loja"
       slaMinutesDefault: 90
     delivery:
       shipFromStore: false
       radiusKm: 15
       slaMinutesExpress: 180
       slaMinutesStandard: 1440
     cepLookup:
       provider: mock       # mock | external - endpoint real e server-only, nunca client
       endpoint: null
   ```
   `mode: centralized` (default) preserva o comportamento atual (`quoteShipping` sem
   loja nenhuma envolvida); `ship-from-store` e `hybrid` habilitam o restante do bloco.
2. **Nova entidade de dados `data.store` em `contracts.yaml`.** Loja fisica: `id`,
   `name`, `cnpj`, `address`, `geoCoordinates`, `pickupEnabled`, `deliveryRadiusKm`,
   `openingHours`. Serve dois consumidores futuros (Fase 9d, fora desta sub-fase):
   o widget de "Delivery Promise" na PDP/carrinho e uma pagina institucional publica
   de lojas - que reforca `geo.entity.napConsistency` (ja existente em
   `contracts.yaml`: nome/endereco/telefone consistentes sao o que torna uma loja
   fisica citavel por mecanismos de IA generativa).
3. **Lista real de lojas e dado de runtime, nao de manifest.** Assim como
   `navigation.departments` (ver `packages/manifests/src/refs.ts > EXTERNAL_ROOTS`),
   a lista de lojas de uma loja Nears especifica vem do painel/CMS, nao e hardcoded em
   `nears.config.yaml`. O manifest so declara a *politica* (`fulfillment.*`); o fixture
   mock (`apps/web/lib/data/stores.ts`) entra na Fase 9d, validado por `storeSchema`.
4. **Aditivo sobre `shipping.ts`, nunca substituicao.** `quoteShipping` continua
   representando a cotacao vinda do CD central. Quando `fulfillment.mode !==
   'centralized'`, a Fase 9d adiciona um branch que tambem calcula retirada/entrega
   pela loja mais proxima do CEP informado - a UI mostra as duas opcoes lado a lado
   quando ambas existem (padrao Ri Happy: frete padrao E retirada em loja).
5. **CEP continua sendo o unico mecanismo de localizacao do cliente.** Nao se usa a
   API de geolocalizacao do navegador: `security.headers.permissionsPolicy` ja nega
   `geolocation=()` globalmente (decisao anterior, nao revisitada aqui) e o padrao
   CEP-first ja e consistente com `pdp-shipping` (ADR 0019).

## Fora do escopo desta sub-fase (9a)

- Qualquer componente de UI (widget de Delivery Promise, pagina de lojas,
  seletor de retirada no carrinho).
- Calculo real de distancia CEP -> loja mais proxima (a 9d implementa com os CEPs
  mock das lojas fixture; calculo geografico real entra quando houver fonte de dados
  real de lojas).
- Qualquer uso do termo "MOI" ate o usuario esclarecer o significado pretendido.

## Consequencias

- `packages/manifests/src/schemas/config.ts` ganha `fulfillmentSchema` e o campo
  `fulfillment` em `configSchema`.
- `packages/manifests/src/schemas/contracts.ts` ganha `storeContractSchema` e o campo
  `store` em `dataSchema`.
- Nenhum preset de nicho (`nears/presets/*.yaml`) precisa mudar: `fulfillment` nao e
  sobrescrito por preset (so `catalog` e `vocabulary` sao).
