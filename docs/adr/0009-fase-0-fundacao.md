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
| `pnpm test` | sem `--` no CI | O `--` e repassado ao vitest, que trata `--coverage` como filtro de arquivo. |
| Headers | HSTS, nosniff, Referrer-Policy, Permissions-Policy e `frame-ancestors` lidos de `nears.config.yaml` em `next.config.ts` | CLAUDE.md > Seguranca. |
| CSP com nonce | **adiado** | `strict-dynamic` exige `proxy.ts` e render dinamico em toda rota, o que conflita com SSG/`cacheComponents`. Decisao de arquitetura para a Fase 4/6. |
| `FoundationsNote` | componente provisorio em `packages/ui` | So prova a cadeia Storybook -> axe -> Vitest. Remover na Fase 3. |
| `tokens:contrast` | stub que avisa que NAO valida contraste | O calculo real e a Fase 1. |
| `manifests:validate` | parse + invariantes do ADR 0003 | Os schemas Zod sao a Fase 2. |

## Estado de verificacao (Mac, Node 22.14, pnpm 9.15.9)

Verificado: `pnpm install`, `manifests:validate`, `pnpm test` (14 testes),
`pnpm typecheck` (3 pacotes), `pnpm lint`.

**Nao verificado ainda** (nao dar a Fase 0 por concluida antes disto):
`pnpm build` ate o fim, `check-budgets`, `pnpm dev` no navegador, E2E,
`build-storybook`, `test:a11y`, `pnpm lh`, e o teste proposital de budget
estourado exigido pelo ROADMAP.

## Riscos em aberto

1. **Nome do parametro dinamico.** O manifest declara `/[slug]/page` e
   `/[productSlug]/p/page` no mesmo nivel. O Next costuma recusar nomes
   diferentes para o mesmo segmento. O build chegou a compilar, mas o
   resultado final nao foi visto; se falhar, o `appRoute` do `pdp` passa a
   `/[slug]/p/page` (manifest e ADR 0003 mudam juntos).
2. **`app-build-manifest.json`.** `check-budgets.mjs` le este arquivo; o
   build com Turbopack do Next 16 pode nao gera-lo.
3. **`partialPrefetching`.** O Next 16.4 avisa que `cacheComponents` sem
   `partialPrefetching` explicito e transitorio. Definir na Fase 0.
