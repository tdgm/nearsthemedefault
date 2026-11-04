# ADR 0013 - Design system (packages/ui): escopo do Radix e alternativas nativas

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 3 (docs/ROADMAP.md) pede 21 componentes: Button, IconButton, Link,
Input, Select, Checkbox, Radio, RadioGroup, VariantSelector, Badge, Price,
Rating, Skeleton, Toast, Tooltip, Accordion, Tabs, Modal, Drawer, Breadcrumb,
Pagination, Carousel e Image. Gate: 100% com story, teste e axe limpo; bundle
do pacote <= 25 KB gzip. CLAUDE.md > Stack restringe Radix a "overlay / menu
/ dialog / radiogroup" e proibe qualquer lib de UI pronta ou de carrossel sem
perguntar antes.

## Decisao

1. **Radix so onde a lista permite**: `@radix-ui/react-dialog` (Modal/Drawer)
   e `@radix-ui/react-radio-group` (RadioGroup/RadioGroupItem, reusado pelo
   VariantSelector). Focus trap e fechamento por Esc do Dialog, e
   role=radiogroup + navegacao por setas do RadioGroup, vem de graca.
2. **Tabs, Accordion, Tooltip e Select ficam fora da lista - implementados a
   mao**, sem dependencia nova:
   - `Accordion`: `<details name="...">`/`<summary>` nativos. O atributo
     `name` (Baseline 2024) da exclusividade entre itens do mesmo grupo sem
     JS. Zero JS, Server Component.
   - `Tabs`: WAI-ARIA Tabs Pattern (ativacao automatica) escrito a mao -
     `role=tablist/tab/tabpanel`, roving tabindex, setas/Home/End. Client
     Component (precisa de estado).
   - `Tooltip`: CSS-only via `:hover`/`:focus-within` (classe `group` do
     Tailwind) + `aria-describedby`. Funciona com JS desabilitado.
   - `Select`: `<select>` nativo estilizado - teclado e semantica de combobox
     ja vem do navegador; nenhuma lib de combobox é necessaria para o caso
     de uso de filtro/formulario desta fase.
3. **Carousel**: scroll-snap nativo (`overflow-x-auto` + `snap-x
   snap-mandatory`) com setas que chamam `scrollBy`. Zero lib de carrossel,
   conforme CLAUDE.md > Performance.
4. **`cx()` proprio** (`packages/ui/src/cx.ts`, 4 linhas) em vez de
   clsx/classnames: evita dependencia nova para um helper trivial.
5. **`formatMoney`/`formatInstallment`/`formatCep`/`formatCnpj`/`formatDateBR`
   vivem em `packages/ui/src/format.ts`**, nao em `apps/web/lib/format.ts`,
   porque o componente `Price` precisa deles e um pacote compartilhado nao
   pode depender do app que o consome. `apps/web/lib/format.ts` reexporta de
   `@nears/ui` para o resto do app continuar importando de "/lib/format"
   (CLAUDE.md > Codigo).
6. **Tailwind no Storybook**: `@tailwindcss/vite` (devDependency da raiz, so
   para o build do Storybook - 0 KB no cliente de apps/web, que continua
   usando `@tailwindcss/postcss` via `next.config` - ADR 0011) +
   `packages/ui/src/styles.css` importando os mesmos `tokens.css`/`theme.css`
   de `apps/web/app/globals.css`. Sem isso, as stories renderizariam sem
   nenhum token aplicado e o axe nao teria cores reais para medir contraste.
7. **`FoundationsNote` (placeholder da Fase 0) removido**: seu proprio
   comentario ja dizia "sera removido quando a Fase 3 entregar os componentes
   reais" (docs/adr/0009).
8. **"Radio" e "RadioGroup" do ROADMAP tornam-se `RadioGroupItem` +
   `RadioGroup`**: a primitiva Radix e group-first (um `Item` sem um `Root`
   ancestral nao funciona), entao nao ha uma versao "solta" sensata de Radio
   fora de um grupo.

## Dependencias novas (com peso)

| Pacote | Onde | Peso instalado | Por que |
| --- | --- | --- | --- |
| `@radix-ui/react-dialog` | `packages/ui` (dependency) | ~45 KB min+gzip | unica forma de ter focus trap + Esc corretos sem reimplementar o dialog pattern; permitido explicitamente pelo CLAUDE.md |
| `@radix-ui/react-radio-group` | `packages/ui` (dependency) | ~8 KB min+gzip | idem, para radiogroup (VariantSelector e RadioGroup) |
| `@tailwindcss/vite` | raiz (devDependency) | so dev; 0 KB no cliente | Storybook usa Vite, nao o pipeline do Next; precisa do plugin Vite do Tailwind 4 para as stories renderizarem com os tokens reais |

Nenhuma delas entra no bundle de `apps/web` fora do que ja seria necessario
(Radix so e importado pelos componentes Modal/Drawer/RadioGroup/
VariantSelector, code-split por secao quando usados fora da rota critica).

## Consequencias

- `pnpm manifests:validate`/demais scripts nao mudam.
- `packages/ui` ganha `@radix-ui/*` como `dependencies` (nao `devDependencies`
  - roda em runtime no cliente quando Modal/Drawer/RadioGroup sao usados).
- Decisao pendente para a Fase 4+: se o mega-menu do Header precisar de Menu
  do Radix, ele ja esta na lista permitida - sem necessidade de novo ADR so
  para isso.
