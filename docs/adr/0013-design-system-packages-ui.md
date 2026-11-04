# ADR 0013 - Design system (`packages/ui`)

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 3 (docs/ROADMAP.md) entrega os atomos e moleculas do template: Button,
IconButton, Link, Input, Select, Checkbox, Radio/RadioGroup, VariantSelector,
Badge, Price, Rating, Skeleton, Image, Breadcrumb, Pagination, Accordion, Tabs,
Tooltip, Toast, Modal/Drawer e Carousel. Gate: 100% com story, teste e axe limpo, e
pacote <= 25 KB gzip. O CLAUDE.md permite Radix apenas para overlay, menu, dialog e
radiogroup e proibe lib de carrossel e CSS-in-JS com runtime.

## Decisao

1. **Tailwind 4 consumindo tokens.** Os componentes usam utilitarios
   (`bg-action`, `text-on-surface`, `min-h-11`, `duration-(--nears-duration-fast)`)
   que apontam para CSS custom properties de `@nears/tokens`; nunca cor literal.
   `packages/ui/src/styles.css` importa Tailwind, os tokens e uma camada base
   (foco visivel, `prefers-reduced-motion`). O app escaneia o pacote com
   `@source` em `globals.css`; o Storybook recebe o PostCSS em `viteFinal`.
2. **Elementos nativos em vez de Radix.** `<dialog>` (Modal/Drawer: focus trap, Esc,
   fundo inerte, retorno de foco), `<details>/<summary>` (Accordion, zero JS),
   `<select>`, `<input type=checkbox|radio>`. Cada primitivo Radix evitado e JS que
   nao entra no orcamento de 140 KB (docs/adr/0010). Radix segue permitido para o
   mega-menu da Fase 4 se o nativo nao bastar; entra com ADR proprio e peso em KB.
3. **Server Components por padrao.** Tem `"use client"` (com justificativa no
   topo do arquivo) apenas: Radio/RadioGroup (contexto), VariantSelector (anuncio
   da selecao), Tabs (foco por setas), Toast (fila + temporizador), Modal
   (`showModal()`), Carousel (`scrollIntoView` + indice).
4. **Seletor de variacao e sempre `radiogroup`** (`fieldset role="radiogroup"` +
   inputs radio), nas exibicoes swatch e option. Opcao indisponivel fica
   `disabled` com texto sr-only (", indisponivel").
5. **Nome acessivel por texto sr-only comeca com virgula.** O calculo de nome
   acessivel apara espacos por filho; sem a virgula o leitor de tela le
   "Parceiroabre em nova aba".
6. **Formatacao BR em `@nears/ui/format`** (R$, parcelamento "Nx de R$ Y sem juros",
   % off, CEP, CNPJ, data dd/mm/aaaa); `apps/web/lib/format.ts` apenas reexporta.
7. **Image** gera `<picture>` AVIF + WebP + fallback a partir de um `loader`
   injetado (a CDN e decisao da plataforma). `width`/`height` sao obrigatorios no
   tipo; acima da dobra e `fetchpriority="high"` sem lazy. `buildAlt` aplica a
   regra de alt de `contracts.yaml > seo.global.altText`.
8. **Orcamento do pacote**: `scripts/check-ui-bundle.mjs` empacota todos os
   componentes (sem tree-shaking, pior caso) com Vite e falha acima de 25 KB gzip.
   Roda em `pnpm validate` e no job de budgets do CI.

## Consequencias

- Sem biblioteca de UI externa: o peso do design system e so o codigo proprio.
- O estilo nativo de `<dialog>`, `<select>` e `<details>` varia entre navegadores;
  o visual e controlado por tokens e testado nas stories (claro e escuro).
- `Tooltip` e CSS-only: aparece em hover e foco, mas nao e dispensavel com Esc.
  Informacao essencial nunca vive so em tooltip (WCAG 1.4.13 fica por conta de uso).
- O axe das stories roda no CI; o Playwright atual nao suporta macOS 12, entao o
  `pnpm test:a11y` local so funciona em macOS 13+ ou Linux.
