# ADR 0024 - E2E do fluxo de compra em mais de um nicho (presets)

Status: aceita (Fase 8)

## Contexto

O template é white-label e multinicho (ADR 0002): eixos de variação, facetas, atributos
GEO e microcopy vêm de `catalog` e `vocabulary`. Até aqui o E2E só rodava o nicho padrão
(`generic`, sem eixos de variação), então nada provava que a PDP, o PLP e o carrinho
seguem o preset: o `ROADMAP` pede o fluxo descoberta → PLP → PDP → carrinho "em pelo menos
dois presets de nicho".

Três lacunas apareceram ao tentar rodar o fluxo em `fashion`:

1. O app não tinha como escolher um preset (só `loadManifests({ preset })` nos scripts).
2. O catálogo mock oferecia sempre cor e tamanho. Em outro nicho o produto não cobria os
   `geoAttributes` (`material`, `model`, `mpn`...) e `onMissingGeoField: fail-build`
   derrubava o build.
3. Microcopy do carrinho espalhada: o preset trocava `cart` ("Sacola") mas o botão e o
   anúncio de `aria-live` continuavam "carrinho" (o texto de "adicionado" era fixo no
   componente). As facetas de eixo (tamanho, voltagem) não tinham opções nem rótulo.

## Decisão

1. **`NEARS_PRESET`** (variável de ambiente server-only, nunca `NEXT_PUBLIC_*`) escolhe
   um preset em `nears/presets/*.yaml`. `loadAllManifests()` passa o nome ao
   `loadManifests`. Vazio = `nears.config.yaml`. O nome só aceita `^[a-z][a-z0-9-]*$`,
   porque vira caminho de arquivo. É um recurso de build/teste: o preset é fixado no build
   (prerender), igual a uma loja real, que tem o catálogo no próprio `nears.config.yaml`.
2. **Mock acompanha o nicho.** `buildMockSnapshot(catalog)` gera uma variação por
   `catalog.variantAxes` (amostras para `display: swatch`, texto para `option`, uma opção
   indisponível por eixo de amostra) e uma linha de especificação para cada
   `geoAttributes` que nenhum eixo cobre. O catálogo continua neutro e passa pelo mesmo
   schema Zod. O nicho padrão (sem eixos) gera exatamente o que gerava antes.
3. **Facetas de eixo.** `facetValues` lê as opções do produto quando a faceta é um eixo de
   variação (cor, tamanho, voltagem...). O rótulo vem do vocabulary (`facetSize`,
   `facetVoltage`...), definido nos presets que usam o eixo como faceta.
4. **Microcopy do carrinho em três chaves** do vocabulary: `cart`, `addToCart` e
   `addedToCart` (nova; o anúncio em `aria-live` deixa de ser texto fixo). Presets que
   renomeiam o carrinho (`fashion`, `beauty`, `grocery`) renomeiam as três.
5. **Um build por preset, em sequência.** `pnpm test:e2e:presets` roda
   `e2e/flow.spec.ts` para cada preset de `e2e/presets.ts` (`fashion` e `electronics`):
   `NEARS_PRESET=<preset>` sobe o `pnpm build && pnpm start` da própria config do
   Playwright, no projeto `preset`. Sem a variável, os projetos `chromium` e `nojs` ignoram
   o `flow.spec.ts`. No modo preset nunca se reaproveita servidor existente na porta.
6. **A tabela de expectativas não pode divergir do YAML.** `e2e/presets.ts` (sem imports de
   Playwright) é conferida pelo vitest contra o preset real: microcopy, eixos, facetas de
   eixo, atributos GEO e regras de indexação.

## O que o fluxo cobre (por preset)

- Home → PLP pelo hub de categorias; carrinho do header com o nome do preset; axe.
- PLP: lista de cards, drawer de filtros com um grupo por faceta de eixo, filtro por faceta
  fora de `catalog.facets.indexable` (`noindex,follow`) e por faceta indexável (continua
  `index`, ADR 0021); PLP → PDP pelo primeiro card; axe.
- PDP: exatamente um `radiogroup` por eixo do nicho, na ordem declarada; tabela de
  especificação em HTML semântico e `additionalProperty` no JSON-LD para os atributos GEO.
- Carrinho: envio barrado pela validação nativa sem escolher variação; POST 200 e anúncio
  em `aria-live="polite"` com o texto do preset; minicart como `dialog` com o nome do
  preset, fechado por Esc com o foco de volta ao botão; axe.

## Alternativas descartadas

- **Dois `distDir` e dois servidores em paralelo:** o Next reescreve o `tsconfig` com o
  `distDir`, e três builds simultâneos estouram o tempo do job em runner de 2 vCPUs.
- **Preset por request/cookie:** o catálogo e as rotas são prerenderizados; ler preset por
  request tornaria toda rota dinâmica e quebraria os orçamentos.
- **Um Playwright project por preset com a tabela no próprio teste:** mais rápido, mas
  duplicaria o YAML sem nenhum guarda contra divergência.

## Consequências

- O CI ganha dois builds de produção no job `E2E` (cerca de 1 a 2 minutos cada).
- Depois de `pnpm test:e2e:presets` o `apps/web/.next` guarda o build do último preset:
  rode `pnpm build` antes de `pnpm lh` ou `pnpm check-budgets`.
- Novo nicho com E2E = uma linha em `e2e/presets.ts`.
- O Lighthouse e os budgets continuam medindo o nicho padrão (o piso da plataforma); os
  presets não têm budget próprio nesta fase.
