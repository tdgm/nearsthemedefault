# ADR 0011 - Build de tokens: Style Dictionary, saidas versionadas e gate de contraste

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 1 (docs/ROADMAP.md) pede um build que transforme `packages/tokens/tokens.json`
em CSS custom properties, tema do Tailwind e JSON para o Figma, com tema claro e
escuro, troca de marca por um unico arquivo, loader de fonte e gate de contraste AA.
O `tokens.json` ja existia (escalas, semanticos, tipografia fluida, espaco, raios,
sombras, z-index, breakpoints, motion) e o ADR 0004 definiu os pares de contraste.

## Decisao

1. **Style Dictionary 5** (`style-dictionary@^5.8.0`) so como `devDependency` do
   pacote de tokens. Pesa ~4,4 MB instalado, **0 KB no bundle do navegador** e nao
   entra em nenhuma rota. Passa em `pnpm audit --audit-level=high`.
2. **Saidas** (todas em `packages/tokens/dist/`, mais o loader de fonte):
   - `tokens.css`: `--nears-*`. Tema claro em `:root`, escuro em
     `[data-theme="dark"]` e, automaticamente, em `prefers-color-scheme: dark`
     (a menos que `data-theme="light"` force o claro). Semanticos apontam para
     primitivos com `var()`, entao a troca de tema so troca referencias.
   - `theme.css`: `@theme inline` do Tailwind 4. **Tailwind 4 nao tem preset em
     JS**; o equivalente e CSS. O arquivo zera a paleta e as escalas padrao
     (`--color-*: initial` etc.), entao `bg-red-500` deixa de existir e so
     funcionam cores vindas de token (CLAUDE.md: nunca cor literal em classe).
     Breakpoints saem como valor literal porque `@media` nao aceita `var()`.
   - `figma.tokens.json`: formato Tokens Studio (sets `global`, `light`, `dark`,
     referencias preservadas).
   - `apps/web/app/_generated/fonts.ts`: loader `next/font/local`.
3. **Arquivos gerados ficam versionados.** Assim `dev`, `build`, `typecheck`,
   `test` e Storybook funcionam sem etapa previa. `pnpm tokens:check` (parte do
   `pnpm validate`) regenera em memoria e falha se o disco divergir; `pnpm
   tokens:build` regrava.
4. **Nucleo sem dependencia** (`packages/tokens/src/core.mjs`): resolucao de
   referencias, matematica de contraste WCAG 2.x e `validateTokens`. O gate nao
   depende do Style Dictionary.
5. **`pnpm tokens:contrast` e real.** Le `contracts.yaml > gates.accessibility`
   (`contrastPairs`, `contrastMin`), resolve os dois temas e falha abaixo de 4,5:1
   (texto) ou 3:1 (UI). Estado: 86 pares, 0 falhas; menor folga
   `badge-promo-on / badge-promo-bg` (claro) com 4,54:1, o mesmo do ADR 0004.
6. **Build falha** se a licenca da fonte nao for OFL-1.1 ou Apache-2.0 (lista em
   `nears.config.yaml > design.typography.licenses`), se os temas tiverem chaves
   diferentes, se uma referencia nao resolver, se uma cor nao for hex ou se a
   escala neutra estiver incompleta.
7. **Status ganharam semanticos** `success`, `warning`, `danger` e `info` nos dois
   temas (a config ja os listava), com tons `*-on-dark` para fundo escuro e quatro
   pares novos em `contracts.yaml`.

## Importacao no app: caminho relativo

`globals.css` importa `../../../packages/tokens/dist/tokens.css` e `theme.css` por
caminho relativo. O import por pacote (`@nears/tokens/tokens.css`, ja exportado em
`package.json`) funciona no `next build`, mas no `next dev` o resolvedor do
Tailwind falha com "Package path ./tokens.css is exported ... but no valid target
file was found", tanto com condicao `style` quanto com string simples (o Node
resolve normalmente). Reavaliar quando o Next/Tailwind corrigirem isso.

## Fonte: `self-hosted` (atualizado nos ADR 0016 e 0020)

`typography.font.brand.source` passou a `self-hosted` com Inter (OFL-1.1) em
2026-11-05 e o padrao voltou a `system` no ADR 0020 (o arquivo continua no repo); o texto abaixo descreve o mecanismo original. O modo `system` (zero
download, pilha websafe) continua disponivel. O arquivo era condicao para
`self-hosted`:
`packages/tokens/fonts/brand-variable.woff2` (woff2 variavel, latin + latin-ext,
`wght` 400-700) for adicionado ao repositorio. O build ja gera o `next/font/local`
com `display: swap`, `preload` do arquivo unico e `adjustFontFallback` contra
Arial/Times New Roman, e falha com mensagem clara se `self-hosted` for pedido sem o
arquivo. Baixar a fonte exige aprovacao do mantenedor.

## Consequencias

- Trocar de marca = trocar `tokens.json` (e o woff2); teste cobre o caso com um
  segundo arquivo de tokens.
- Alterar `tokens.json` sem rodar `pnpm tokens:build` quebra `pnpm validate` e o CI.
- Custo medido (Fase 1): JS inicial inalterado em 135,7 KB; CSS inicial 2,2 -> 3,7 KB
  (limite 30 KB).
- Fora do escopo desta fase: schema Zod do `tokens.json` (Fase 2) e a pagina de
  documentacao dos tokens no Storybook (Fase 3).
