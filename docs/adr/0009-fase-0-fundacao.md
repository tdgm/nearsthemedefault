# ADR 0009 - Fase 0: fundacao (decisoes e estado de verificacao)

- Status: aceito (Fase 0 em andamento, NAO concluida)
- Data: 2026-11-04

## Contexto

Scaffold da Fase 0 (docs/ROADMAP.md): monorepo pnpm, Next 16, TS strict,
ESLint/Prettier, Vitest, Playwright, Storybook, Lighthouse CI. As versoes foram
conferidas no registro npm no dia e instaladas no Mac do mantenedor (o
sandbox da sessao nao alcanca o registro).

## Decisoes

| Tema | Decisao | Motivo |
| --- | --- | --- |
| TypeScript | `~5.9.3`, nao 7.0 | 7.0 e o porte novo do compilador; o ecossistema de lint ainda declara peers antigos. Revisitar. |
| Storybook | 8.6.19 com `@storybook/react-vite` | CLAUDE.md fixa Storybook 8. `@storybook/nextjs` nao e necessario: `packages/ui` nao depende de Next. |
| Vite | `^6.4.5` | Storybook 8.6 so aceita Vite ate 6 (peer). |
| jsdom | `^28.1.0` | jsdom 30 exige Node >= 22.22 e puxa undici 8, que quebrou no Node 22.14. `engines.node` = `>=22.13.0`. |
| ESLint | 9.39.5 | O registro marca a linha 9 como deprecated. Migrar para 10 quando `eslint-config-next` e `typescript-eslint` confirmarem suporte; nao testado. |
| pnpm | 9.15.9 via `packageManager` (corepack) | Mesmo major do CI (`PNPM_VERSION: "9"`); o pnpm 8 gera lockfile incompativel. |
| `basic-ftp` | `pnpm.overrides` para `>=6.2.1` | `pnpm audit --audit-level=high` (gate do CI) reprovava `basic-ftp <=6.2.0`, transitivo de `@lhci/cli` > lighthouse > puppeteer-core > proxy-agent. Fica so em ferramenta de CI, fora do bundle. Remover quando o `@lhci/cli` atualizar. |
| `pnpm test` | sem `--` no CI | O `--` e repassado ao vitest, que trata `--coverage` como filtro de arquivo. |
| Headers | HSTS, nosniff, Referrer-Policy, Permissions-Policy e `frame-ancestors` lidos de `nears.config.yaml` em `next.config.ts` | CLAUDE.md > Seguranca. |
| CSP com nonce | **adiado** | `strict-dynamic` exige `proxy.ts` e render dinamico em toda rota, o que conflita com SSG/`cacheComponents`. Decisao de arquitetura para a Fase 4/6. |
| `FoundationsNote` | componente provisorio em `packages/ui` | So prova a cadeia Storybook -> axe -> Vitest. Remover na Fase 3. |
| `tokens:contrast` | stub que avisa que NAO valida contraste | O calculo real e a Fase 1. |
| `manifests:validate` | parse + invariantes do ADR 0003 | Os schemas Zod sao a Fase 2. |

## Estado de verificacao (Mac, Node 22.14, pnpm 9.15.9, macOS 12)

Verificado e passando:

- `pnpm install --frozen-lockfile`
- `pnpm manifests:validate`
- `pnpm test` (14 testes)
- `pnpm typecheck` (3 pacotes)
- `pnpm lint`
- `pnpm build` (Next 16.4.5, Turbopack)
- `next start` em producao: 8 formas de rota respondem 200, headers de
  seguranca presentes, sem `X-Powered-By`
- `pnpm dev` na porta 3000
- E2E Playwright com Chrome do sistema (`PW_CHANNEL=chrome`), contra o servidor
  de **dev**: 19 passaram, 1 pulado de proposito (axe no projeto `nojs`)
- `pnpm build-storybook` e axe avulso na unica story: 0 violacoes
- `pnpm audit --audit-level=high`: exit 0 depois do override de `basic-ftp`
  (1 high transitivo de `@lhci/cli`; restam 7 moderate e 1 low, fora do gate)

**Falhando de proposito (decisao pendente):** `pnpm check-budgets` reprova as
6 rotas criticas por JS (135,7 KB gzip contra 120 KB). CSS (2,1 KB) e HTML
(3,8 KB) estao dentro.

**Nao verificado:**

- `pnpm test:a11y` oficial: o test-runner do Storybook usa o Chromium do
  Playwright, que nao suporta macOS 12. Roda no CI, nao localmente.
- E2E contra o build de producao (rodou contra o dev server).
- `pnpm lh` (Lighthouse CI) e `check-third-party-hosts.mjs`.
- O workflow do GitHub Actions em si; nenhum job do CI foi executado.

## Riscos em aberto

1. **Nome do parametro dinamico (RESOLVIDO).** O manifest declarava
   `/[slug]/page` e `/[productSlug]/p/page` no mesmo nivel. O `next build`
   passava, mas `next start` falhava com "You cannot use different slug names
   for the same dynamic path ('productSlug' !== 'slug')". O `appRoute` do
   `pdp` passou a `/[slug]/p/page`; o segmento literal `p` continua vencendo
   `/[slug]/[sub]` (ADR 0003).
2. **`app-build-manifest.json` (RESOLVIDO).** O Next 16 com Turbopack nao o
   gera. `check-budgets.mjs` agora le `.next/diagnostics/route-bundle-stats.json`
   (chunks de primeiro carregamento por rota) e `.next/app-path-routes-manifest.json`
   (appRoute -> rota), e procura CSS em `static/` (Turbopack nao usa `static/css`).
3. **`partialPrefetching` (RESOLVIDO).** Agora explicito em
   `rendering.partialPrefetching: true` (manifest -> `next.config.ts`); o aviso
   do build sumiu. Sem efeito em bytes (ADR 0010).
4. **Orcamento de JS estourado ja no app vazio (RESOLVIDO pelo ADR 0010:
   limite 140 KB).** Medido com o
   `check-budgets.mjs` corrigido: todas as rotas criticas carregam 135,7 KB de
   JS gzip (react-dom 71,8 + cliente do Next 46,6 + restante) contra o limite
   de 120 KB, sem nenhum componente de loja ainda. Nao e regressao de codigo
   nosso. Decisao pendente do mantenedor: subir o limite (exige ADR),
   reduzir o custo-base do framework ou reavaliar a medicao.

## Revisao de rotas e busca (/s)

- `/s` agora e a rota de busca real: formulario GET nativo (`role="search"`,
  campo rotulado, funciona sem JS), estado **vazio** (sem `q` ou so espacos) e
  estado **sem resultados** (com `q`). Termo aparado, limitado a 100 caracteres e
  renderizado como texto. `noindex,nofollow` explicito na pagina. Microcopy vem
  de `vocabulary.search*` em `nears.config.yaml` (helper `vocab()`).
- `searchParams` fica dentro de `<Suspense>` (exigencia do `cacheComponents`):
  o shell (H1 + formulario vazio) sai no HTML estatico.
- Home de evolucao ganhou "Estados de tela" (busca vazia, sem resultados, 404);
  o exemplo de `not-found` passou a `/a/b/c/d/e`, que de fato retorna 404.
- **Achado para a Fase 6 (gate):** slugs desconhecidos/reservados
  (`/qualquer-coisa`, `/404`, `/s/x` etc.) ainda caem no `[slug]` placeholder e
  respondem 200. Retornar 404 real depende da resolucao por slug-index (ADR 0003).
  Barras finais redirecionam com 308 (comportamento padrao do Next).
- Verificado no Mac: 19 testes unitarios, typecheck, lint, manifests e 19 E2E
  (chromium) verdes, incluindo axe em `/`, `/s`, `/s?q=` e 404.

## Orcamento de JS e teste de estouro (2026-11-04)

- Investigacao e decisao em `docs/adr/0010-orcamento-de-js-e-piso-do-framework.md`:
  limite de JS 120 -> 140 KB (piso do framework ~135,5 KB).
- `pnpm check-budgets` verde no Mac (JS 135,7 KB <= 140; CSS 2,2 KB; HTML 4 KB).
- Teste de estouro de proposito feito: com `js_initial_kb: 100` o script falha
  (exit != 0) nas 6 rotas criticas; config restaurado em seguida.

## Primeira execucao do CI (PR #6, 2026-11-04)

Tres falhas de configuracao, nenhuma de codigo:

1. `pnpm/action-setup`: "Multiple versions of pnpm specified" (`version: 9` no
   workflow + `packageManager` no package.json). Removido o `version`; a fonte
   unica e o `packageManager` (pnpm 9.15.9).
2. `gitleaks-action`: `GITHUB_TOKEN` passou a ser obrigatorio em PRs. Adicionado
   o env e `pull-requests: read` (least-privilege) so nesse job.
3. `dependency-review-action`: "not supported on this repository" (repo privado
   sem Dependency graph + GitHub Advanced Security). O job so roda em repo
   publico; em privado o gate de dependencias e o `pnpm audit
   --audit-level=high` do job `validate`. Para reativar, habilitar GHAS.
4. Job `test`: `pnpm test --coverage` falha no pnpm 9 ("Unknown option:
   'coverage'"). Passou a `pnpm exec vitest run --coverage` (conferido no Mac:
   19 testes, exit 0).

## Lighthouse no CI (descobertas da primeira execucao)

- `npx wait-on` nao existe no repo e subir o servidor com `&` e fragil. O
  proprio LHCI agora sobe e derruba o servidor (`collect.startServerCommand`),
  sem dependencia nova; o job chama `pnpm lh`.
- **O `settings.budgets` do `lighthouserc.json` nunca foi aplicado.** O
  Lighthouse 13.6 (usado pelo `@lhci/cli` 0.16) nao tem mais a Budgets API:
  `configSettings.budgets` vem `null` e a auditoria `performance-budget` nao
  existe no relatorio, entao a assertion passava em silencio. Substituido pelas
  chaves nativas `resource-summary:total:count` (<= 40), `:document:size` (<= 80
  KB) e `:third-party:size` (<= 80 KB). JS e CSS ficam so no
  `check-budgets.mjs` (gzip estatico), porque o LHCI mede bytes transferidos
  com cabecalhos HTTP: 143.649 B no app vazio contra 135,7 KB de corpo gzip.
- Medido no Mac (Chrome 150, 1 execucao por rota, throttling mobile): LCP 0,8-1,4 s,
  CLS ~0, acessibilidade 100, 0 hosts de terceiros, 11-13 requisicoes. SEO 54
  (`is-crawlable` e `robots-txt`, ambos intencionais ate a Fase 7), por isso
  `categories:seo` esta em `warn` ate la (anotado no ROADMAP, Fase 7).
- **Em aberto:** TBT oscilou de 227 a 1016 ms entre rotas com o mesmo bundle
  (maquina local carregada, 1 execucao). A mediana de 3 execucoes no runner do
  CI e o numero que vale; se o TBT estourar 200 ms la, o custo de hidratacao
  do bundle base (ADR 0010) passa a ser o problema real.

## Busca sem JavaScript

Com `cacheComponents`, `searchParams` e dado de requisicao: o Next envia o
shell estatico e faz stream do resultado em `<div hidden id="S:0">`, que o
React so revela com JavaScript (verificado no build de producao). Sem JS o
formulario aparece e envia por GET, mas o estado vazio / sem resultados nao fica
visivel. `/s` e `noindex`, entao a regra de conteudo indexavel sem JS do
CLAUDE.md nao se aplica; os 4 testes E2E desses estados rodam so com JS e o
`nojs` continua validando H1, `main` e metadados. Revisitar na Fase 6, quando a
busca tiver resultados reais.
