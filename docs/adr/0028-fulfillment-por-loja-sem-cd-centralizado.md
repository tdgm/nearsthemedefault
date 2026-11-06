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
  realizada. **Esclarecido pelo proprio usuario em 2026-11-06**: "Multi Omni
  Inventary ou Multi Level Inventary, leitura de estoques disponivel nas lojas" -
  ou seja, visibilidade de estoque *por loja* (cada loja com sua propria
  quantidade por SKU), nao um pool unico central. Nao e termo oficial confirmado da
  VTEX (nenhuma busca o encontrou na documentacao publica), mas e o conceito que o
  usuario pediu e que o fulfillment por loja de fato precisa: sem isso, "retirar
  nesta loja" ou "entregar a partir da loja mais proxima" so poderia assumir
  disponibilidade, nunca confirma-la. Modelado abaixo como `fulfillment.inventory`
  (politica) e `data.storeInventory` (contrato de dados).

## Atualizacao (2026-11-06, mesmo dia - resolve a pendencia acima)

Com o significado de MOI confirmado, dois acrescimos a decisao original (ainda sem
UI nem fixture - so contrato, igual ao restante da Fase 9a):

- `fulfillment.inventory: { mode: shared | per-store, provider: mock | external }`.
  `shared` (default) preserva o comportamento atual: estoque e um pool unico
  (`product.offers.availability`), sem granularidade por loja - mode `centralized`
  so faz sentido com `shared`. `per-store` ativa a leitura de `data.storeInventory`
  por loja antes de prometer retirada/entrega; natural com `mode: ship-from-store`
  ou `hybrid`, mas a validacao nao forca o acoplamento (uma loja pode ter poucos
  SKUs e preferir nao rastrear por unidade ainda).
- Nova entidade `data.storeInventory` em `contracts.yaml`: `storeId`, `sku`,
  `quantity`, `reservable`. Fixture mock entra na Fase 9d junto do fixture de
  `store`, como a mesma ADR ja previa.

## Correcao (2026-11-06, mesmo dia - "MOI" nao e o que a secao acima diz)

O usuario trouxe a fonte oficial: [VTEX - Multilevel Omnichannel Inventory
(MOI)](https://help.vtex.com/pt/docs/tutorials/multilevel-omnichannel-inventory).
O termo existe de verdade, mas descreve algo **diferente** do que a secao
"Contexto" acima e o ROADMAP registraram (a esclarecimento anterior do
usuario, de memoria e sem a fonte em maos, nao correspondia ao termo real):

- MOI e uma configuracao de **marketplace multi-seller**, nao de estoque por
  loja fisica. Hierarquia de 3 niveis: **nivel 1** (o marketplace, onde o
  produto e vendido), **nivel 2** (o seller direto, dono do estoque e do
  fulfillment - e tambem marketplace dos proprios sellers white-label),
  **nivel 3** (sellers white-label, contas de franquia e lojas fisicas - mas
  so quando essa loja fisica e ela mesma *uma conta VTEX seller*, nao um
  mero ponto de retirada). So um nivel de recursao e permitido.
- O que MOI de fato controla: se o estoque de um seller de nivel 3 fica
  disponivel para venda no marketplace de nivel 1 (por padrao, nao fica).
  Configuracao e por seller (campo **Fulfillment Endpoint** no admin,
  formato `.../api/checkout?affiliateid={id}&sc={tradePolicyId}`), com
  restricoes pesadas: pagamento so do marketplace, sem Price Table/Manual
  Price, sem Regiao, cupom/giftcard so no nivel 1, pedido rejeitado por um
  seller de nivel 3 nao e reatribuido.
- **Nao ha, em nenhum lugar do MOI real, o conceito "ler a quantidade de SKU
  X disponivel na loja fisica Y antes de prometer retirada/entrega"** - que
  e o problema que esta ADR precisa resolver (fulfillment por loja sem CD).
  MOI resolve um problema de *marketplace* (qual seller vende o que), nao de
  *fulfillment* (de onde sai o pedido fisicamente).

Consequencia pratica: `fulfillment.inventory` (`mode: shared | per-store`) e
`data.storeInventory` continuam exatamente como modelados abaixo - o
conceito ("estoque granular por loja") e real e necessario para ship-from-store/
retirada, so nao vem do MOI da VTEX. Este template e frontend-only e
backend-agnostico (CLAUDE.md: VTEX/hering.com.br e so referencia estrutural,
nunca integracao real), entao a hierarquia de marketplace multi-seller do
MOI simplesmente nao se aplica aqui - nao ha "nivel 1/2/3" para modelar.
`docs/ROADMAP.md` (secao da Fase 9) atualizado para nao atribuir mais o
conceito a VTEX/MOI.

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
- Fixture mock de `storeInventory` e a logica que consulta "tem estoque nesta loja
  antes de prometer retirada" (Fase 9d; aqui so o contrato de dados).

## Consequencias

- `packages/manifests/src/schemas/config.ts` ganha `fulfillmentSchema` (incluindo
  `inventory`) e o campo `fulfillment` em `configSchema`.
- `packages/manifests/src/schemas/contracts.ts` ganha `storeContractSchema`,
  `storeInventoryContractSchema` e os campos `store`/`storeInventory` em
  `dataSchema`.
- Nenhum preset de nicho (`nears/presets/*.yaml`) precisa mudar: `fulfillment` nao e
  sobrescrito por preset (so `catalog` e `vocabulary` sao).
