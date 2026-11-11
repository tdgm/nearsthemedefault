# 0039 - Tipografia da V1: Bricolage Grotesque

## Status

Aceita.

## Contexto

A V1 aprovada no canvas usa Bricolage Grotesque (OFL-1.1) com titulos
condensados (eixo `wdth`). Ate aqui o template rodava em `system` (zero
download) e o ADR 0036 nao adotou a fonte por custo. O dono pediu a tipografia
da V1 no codigo.

## Decisao

1. `typography.font.brand` passa a `self-hosted`, nome `Bricolage Grotesque`,
   licenca OFL-1.1, um unico woff2 variavel (`packages/tokens/fonts/`),
   `font-display: swap`, preload unico, fallback Arial com `size-adjust`
   calculado pelo `next/font/local` (nao a mao). Mesma familia unica de sempre
   (`maxFamilies: 1`); pesos servidos continuam 400/500/700.
2. **Subset latin** (cobre pt-BR). `latin-ext` custaria +32 KB e so serve a
   caracteres fora do portugues; `nears.config.yaml > subset` passa a `[latin]`.
3. Novo token `typography.width.heading` (88) aplicado a `h1-h3` em
   `globals.css` via `font-variation-settings: 'wdth'`. Fonte sem eixo `wdth`
   (modo `system`) ignora a regra.
4. A Inter deixa de ser a fonte pre-aprovada no repo (o arquivo e substituido);
   continua na lista curada do ADR 0001 como opcao por marca.

## Custo

Arquivo de ~78 KB no caminho critico (antes: 0 em `system`; a Inter pre-aprovada
pesava ~76 KB). Nao entra no orcamento de JS/CSS; `pnpm lh` (LCP/CLS) confere
no CI. Voltar ao zero download: `source: system` em `tokens.json`.
