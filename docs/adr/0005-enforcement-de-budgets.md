# ADR 0005 - Qual mecanismo aplica cada budget

- Status: aceito
- Data: 2026-11-03

## Contexto

`scripts/check-budgets.mjs` só media JS e CSS por análise estática do output
do build (`.next`). As outras linhas da tabela de orçamento do `CLAUDE.md` -
HTML, requisições iniciais, hosts de terceiros, JS de terceiros, LCP, INP,
CLS, TTFB - apareciam em `nears/nears.config.yaml` como se fossem gate do CI,
mas nada as verificava. A assertion `third-party-summary` em
`lighthouserc.json` também media a métrica errada: o `numericValue` dessa
auditoria do Lighthouse é tempo de bloqueio da thread principal (ms), não KB
transferido, então `maxNumericValue: 80000` (80 segundos) nunca falhava nada.

Nem todo budget pode ser medido do mesmo jeito. JS e CSS por rota saem do
build sem precisar de um servidor rodando. HTML estático também. Já
requisições, hosts e tempo de carregamento só existem quando uma página é
realmente carregada por um navegador - isso é Lighthouse, não análise de
arquivo.

## Decisão

Cada linha do budget tem exatamente um mecanismo responsável:

| Linha do budget | Mecanismo | Quando roda |
| --- | --- | --- |
| JS inicial (rota crítica) | `scripts/check-budgets.mjs` (gzip estático) | job `budgets`, após `pnpm build` |
| CSS inicial | `scripts/check-budgets.mjs` | job `budgets` |
| HTML | `scripts/check-budgets.mjs`, só para rotas 100% estáticas (SSG, sem segmento dinâmico) | job `budgets` |
| HTML de rota dinâmica/ISR | `performance-budget` (Lighthouse Budgets API, `resourceSizes: document`) | job `lighthouse` |
| Requisições iniciais | `performance-budget` (`resourceCounts: total`) | job `lighthouse` |
| JS de terceiros | `performance-budget` (`resourceSizes: third-party`) | job `lighthouse` |
| Hosts de terceiros distintos | `scripts/check-third-party-hosts.mjs`, lendo `third-party-summary` do relatório LHCI | job `lighthouse`, após `autorun` |
| LCP / CLS / TTFB | assertions dedicadas já existentes (`largest-contentful-paint`, `cumulative-layout-shift`, `server-response-time`) | job `lighthouse` |
| INP | `total-blocking-time` como proxy de laboratório (INP de campo não existe em lab data) | job `lighthouse` |

`check-budgets.mjs` identifica a rota crítica lendo `appRoute` de
`routes.manifest.yaml` - nunca um nome de rota chutado. Rotas ainda não
implementadas são avisadas, não falham o build (o repo começa vazio e
avança fase a fase). Uma rota implementada cuja chave não aparece no build
manifest É uma falha dura: manifest e código divergiram.

`check-third-party-hosts.mjs` existe porque hosts distintos não têm
assertion nativa no Lighthouse Budgets API (que conta requisições, não
domínios). O script lê a mesma auditoria `third-party-summary` que o
Lighthouse já calcula e aplica o limite de `nears.config.yaml`.

## Nota de honestidade (fechada na Fase 8)

Esta nota perguntava se o Lighthouse CI expõe assertions granulares por tipo de
recurso. **Expõe**: o `@lhci/cli` 0.16 (Lighthouse 13) aceita as chaves
`resource-summary:<tipo>:size|count` (bytes transferidos, com cabeçalhos HTTP) e o
`lighthouserc.json` já as usa para contagem total de requisições, HTML e peso de
terceiros. O Lighthouse 13 removeu a Budgets API e a auditoria `performance-budget`
(o antigo `settings.budgets` era ignorado; ver o `_comment` do `lighthouserc.json`),
então a assertion `performance-budget: { minScore: 1 }` que esta nota descrevia nunca
avaliava nada e saiu. JS e CSS iniciais continuam medidos por `scripts/check-budgets.mjs`
(gzip estático, fonte da verdade; ADR 0010), e hosts de terceiros por
`scripts/check-third-party-hosts.mjs`. Cada violação aponta a linha exata que quebrou.

## Consequências

- `check-budgets.mjs` deixa de silenciosamente "passar" em requisições, hosts
  e JS de terceiros: ele diz explicitamente que não mede essas três e aponta
  para onde são medidas.
- Dois scripts passam a correr nos dois jobs certos; `.github/workflows/ci.yml`
  ganha um step novo no job `lighthouse`.
- A assertion `third-party-summary` com unidade errada sai do
  `lighthouserc.json`.
