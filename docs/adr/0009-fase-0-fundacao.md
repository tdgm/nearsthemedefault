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
- O teste de budget estourado de proposito exigido pelo ROADMAP (so faz
  sentido depois da decisao sobre o limite de JS).
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
3. **`partialPrefetching`.** O Next 16.4 avisa que `cacheComponents` sem
   `partialPrefetching` explicito e transitorio. Definir na Fase 0.
4. **Orcamento de JS estourado ja no app vazio (EM ABERTO).** Medido com o
   `check-budgets.mjs` corrigido: todas as rotas criticas carregam 135,7 KB de
   JS gzip (react-dom 71,8 + cliente do Next 46,6 + restante) contra o limite
   de 120 KB, sem nenhum componente de loja ainda. Nao e regressao de codigo
   nosso. Decisao pendente do mantenedor: subir o limite (exige ADR),
   reduzir o custo-base do framework ou reavaliar a medicao.
