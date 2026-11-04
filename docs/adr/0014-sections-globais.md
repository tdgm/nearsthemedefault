# ADR 0014 - Sections globais (`packages/sections`)

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 4 (docs/ROADMAP.md) entrega PromoBar, Header, NavDrawer, Minicart, Footer e
CustomerService, montados no layout raiz. Gate: JS inicial <= 140 KB gzip com header e
footer montados (docs/adr/0010); se nao couber, reduzir ilhas client antes de subir o
limite.

## Decisao

1. **Overlay nativo.** `Overlay` (Server Component sobre `<dialog>`, fechamento por
   `<form method="dialog">`) e `OverlayTrigger` (unica ilha client, so abre o dialog).
   Focus trap, Esc, fundo inerte e retorno de foco vem do navegador. NavDrawer e
   Minicart usam o par; nenhum Radix entra.
2. **Desktop usa o drawer, nao mega-menu.** O NavDrawer multi-eixo (departamento e tipo
   de produto) serve todos os breakpoints. Mega-menu fica fora da rota critica; se
   voltar, entra com ADR proprio e peso em KB.
3. **Separacao spec/componente.** Cada section tem `*.spec.ts` (puro, sem JSX) e o
   componente `.tsx`. `scripts/manifests-validate.mjs` roda em Node com type stripping
   e nao carrega `.tsx`; por isso o registry valida as specs (`specs.ts`) e os modulos
   completos (`modules.ts`) sao testados no Vitest, incluindo paridade entre as chaves
   do schema Zod e as `props` do manifest.
4. **Footer sem JS.** Colunas colapsaveis em mobile via `<details>`; em desktop ficam
   abertas por CSS (`::details-content`). O `<summary>` continua focavel no desktop
   (aceito: nao ha seletor CSS que o remova da ordem de tab sem JS).
5. **PromoBar.** Altura reservada no servidor (CLS zero); o countdown e a unica ilha
   client e hidrata tarde. O dispensar (dismiss) nao persiste ainda.
6. **Landmarks de busca** distintos por `aria-label` (formulario do header e da pagina
   de busca), exigencia do axe para dois `role=search`.

## Adiado

- Variante `minimal` do header por rota: o resolvedor (`variant.ts`) existe e e testado,
  mas as rotas de checkout so existem na Fase 6.
- Persistencia do dismiss da PromoBar, cupom, calculo de frete por CEP, cross-sell,
  controles de quantidade no Minicart e autocomplete de busca: Fase 6 (server actions).

## Medicao (pnpm validate, Mac, Node 24)

| Metrica | Antes (Fase 3) | Fase 4 | Limite |
| --- | --- | --- | --- |
| JS inicial (gzip) | 135.7 KB | 136.6 KB | 140 KB |
| CSS total | 6 KB | 7 KB | 30 KB |
| HTML home (gzip) | - | 8.8 KB | 80 KB |
| `@nears/ui` (gzip) | 8.40 KB | 9.26 KB | 25 KB |

Folga restante de JS: 3.4 KB. As fases 5 e 6 devem evitar novas ilhas client na rota
critica (Hero e Showcase com scroll-snap nativo, sem JS de carrossel).
