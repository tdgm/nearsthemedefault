# Onboarding: criar uma loja a partir do template Nears

Para quem vai subir uma loja nova. O template é o front-end base de qualquer nicho de
varejo online: marca, nicho, estrutura e dados mudam em arquivos declarativos, nunca no
código. Regras gerais em [CLAUDE.md](../CLAUDE.md); decisões em [docs/adr](./adr).

## 1. Rodar local

Requisitos: Node `>=22.18` e pnpm `9.15.9` (`packageManager` no `package.json`).

```bash
pnpm install --frozen-lockfile
pnpm dev          # http://localhost:3000 (copia a lib do Partytown antes)
pnpm storybook    # http://localhost:6006, uma story por componente e estado
```

Sem backend o app usa um catálogo mock neutro (`apps/web/lib/data/mock.ts`, ADR 0017) que
passa pelos mesmos schemas Zod da resposta real. Para ver a loja em outro nicho sem editar
nada: `NEARS_PRESET=fashion pnpm dev` (presets em `nears/presets/`, ADR 0024).

## 2. As quatro coisas que uma loja muda

| O quê | Onde | Depois de editar |
| --- | --- | --- |
| **Marca**: cor, fonte, raio, espaço, mídia | `packages/tokens/tokens.json` | `pnpm tokens:build` e `pnpm tokens:contrast` (falha se algum par semântico não atingir AA) |
| **Nicho**: eixos de variação, facetas, atributos GEO, microcopy | blocos `catalog` e `vocabulary` de `nears/nears.config.yaml` | `pnpm manifests:types` e `pnpm manifests:validate` |
| **Estrutura**: páginas, sections, URLs | `nears/sections.registry.yaml` e `nears/routes.manifest.yaml` | `pnpm manifests:validate` |
| **Dados**: catálogo, páginas, políticas da loja | data layer (`apps/web/lib/data`) | `pnpm test` |

### Marca

Uma família de fonte variável, open source (OFL ou Apache), self-hosted e subsetada
(ADR 0001); modo `system` não baixa nada. Nenhuma cor, fonte, raio ou espaço literal em
classe ou componente: tudo sai de token.

### Nicho

Copie o bloco `catalog` e `vocabulary` do preset mais próximo (moda, eletrônicos, casa,
beleza, mercado ou pet; ADR 0002) para `nears/nears.config.yaml` e ajuste:

- `variantAxes`: um item por eixo de variação do SKU (`display: swatch` ou `option`). Cada
  eixo vira um `radiogroup` obrigatório na PDP e, se estiver em `facets.available`, uma
  faceta do PLP (rótulo `facet<Eixo>` no vocabulary).
- `geoAttributes`: o que o produto precisa informar para o JSON-LD ficar completo. Atributo
  que nenhum eixo cobre (`schemaOrg`) vira linha da tabela de especificação. Produto sem
  campo GEO **derruba o build** (`onMissingGeoField: fail-build`).
- `facets.indexable`: facetas com URL indexável. As demais viram `noindex,follow` (ADR 0021).
- Microcopy do carrinho anda em três chaves juntas: `cart`, `addToCart`, `addedToCart`.

Comportamento nunca depende de `catalog.vertical`: se algo muda por nicho, vira campo explícito.

### Estrutura

A composição de cada template vem do manifest (`templates.<id>.sections`). Mudar a ordem
de uma página é mudar o YAML. Uma section nova precisa de componente, `schema` (Zod),
`meta` (prioridade, CWV, a11y) e story; sem os quatro o registry rejeita no build.

### Dados

`getSnapshot()` é a única porta de dados. Para ligar o backend, o transporte GraphQL já
existe (`lib/data/graphql.ts`, só servidor: endpoint e token por variável de ambiente,
nunca `NEXT_PUBLIC_*`) e a resposta continua validada por `catalogSnapshotSchema`; troque
a fonte dentro de `client.ts`, sem tocar em rota ou section. Pagamento e carrinho reais são
do backend: este repositório nunca processa, guarda ou registra dado de pagamento.

## 3. Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `SITE_URL` | URL pública da loja (`https://...`). Define canonical, sitemap, hreflang e JSON-LD. Sem ela o app avisa e usa `http://localhost:3000`. **Obrigatória em produção.** |
| `NEARS_PRESET` | Só para teste/demonstração: carrega `nears/presets/<nome>.yaml` em vez do `catalog` do config. Não definir em produção. |
| credenciais do backend | Endpoint e token do GraphQL: variáveis server-only. |

## 4. Antes de publicar

- **Domínio:** a resolução de loja por domínio nunca confia no header `Host`; precisa validar
  contra a lista de domínios verificados do painel (ADR 0016, `security.multiTenancy`).
- **Agentes de IA:** `contracts.yaml > geo.agents` define quem pode rastrear (`allow` ou
  `disallow` por agente) e gera `robots.txt` e `llms.txt`. O padrão permite os que citam a
  loja e bloqueia o que só alimenta corpus de treino (ADR 0016). Revise por loja.
- **Dados da entidade:** nome, endereço, CNPJ, fundação e `sameAs` do `organization` precisam
  bater com o que está em outros lugares (consistência de NAP).
- **Headers de segurança:** vêm de `security.headers`; a CSP de base não tem `script-src`
  (ADR 0025). Se o carrinho ou a newsletter enviarem formulário para outro domínio, liste a
  origem em `contentSecurityPolicy.formActionOrigins`.
- **Terceiros:** zero por padrão. Cada script entra em `thirdParties.scripts` com ADR próprio
  (`adr`), roda em worker (Partytown) e, fora do worker, exige `mainThreadReason`. Limite de
  8 hosts e 80 KB de JS de terceiros (ADR 0023). O coletor de RUM externo conta como host.
- **RUM:** em `observability.rum`, troque `endpoint` por uma URL https do coletor e ajuste
  `sampleRate` (ADR 0022). O mock descarta o beacon.

## 5. Checklist de entrega (Definition of Done)

```bash
pnpm validate             # lint, tipos, manifests, tokens, testes, build, budgets
pnpm test:e2e             # fluxo e rotas, com axe (0 violações)
pnpm test:nojs            # todo conteúdo indexável existe sem JavaScript
pnpm test:e2e:presets     # fluxo de compra em fashion e electronics
pnpm test:a11y            # axe em todas as stories
pnpm lh                   # Lighthouse CI contra o build (CWV e resource-summary)
```

`pnpm test:e2e:presets` deixa em `apps/web/.next` o build do último preset: rode `pnpm build`
de novo antes de `pnpm lh` ou `pnpm check-budgets`.

Mexeu em rota: valide os schemas do template em
[Rich Results Test](https://search.google.com/test/rich-results). Decisão de arquitetura
nova: um ADR em `docs/adr/`. Dependência nova: informe o peso em KB, o motivo e passe em
`pnpm audit --audit-level=high`.

## 6. Orçamentos

Fonte da verdade: `nears/nears.config.yaml > budgets`. O CI falha se estourar.

| Métrica | Limite | Quem mede |
| --- | --- | --- |
| JS inicial da rota crítica | 140 KB gzip | `pnpm check-budgets` |
| CSS inicial / HTML | 30 KB / 80 KB | `pnpm check-budgets` |
| Requisições / hosts / JS de terceiros | 40 / 8 / 80 KB | Lighthouse CI e `check-third-party-hosts` |
| LCP / INP / CLS / TTFB (p75 mobile) | 2,0 s / 200 ms / 0,05 / 400 ms | Lighthouse CI (lab) e RUM (campo) |

Como acompanhar em produção: [MEDICAO.md](./MEDICAO.md).
