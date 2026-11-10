# ADR 0010 - Orcamento de JS inicial: piso do framework e novo limite

Status: aceito (2026-11-04). Revisitar na Fase 4.

## Contexto

O limite de 120 KB gzip de JS inicial (CLAUDE.md) falhava em todas as rotas
criticas com o app **vazio**: 135,5 KB gzip, 456 KB sem compressao, 7 chunks
(medido com `scripts/check-budgets.mjs` e conferido por script proprio sobre
`.next/diagnostics/route-bundle-stats.json`, gzip nivel 9).

| Chunk | gzip |
| --- | --- |
| react-dom (+ scheduler) | ~69,9 KB |
| cliente/router do Next (App Router, segment cache, prefetch) | ~45,4 KB |
| compilado do Next (useSyncExternalStore etc.) | ~7,6 KB |
| runtime do Turbopack | ~3,8 KB |
| demais (3 chunks do router) | ~8,6 KB |

Nao ha codigo de loja nesses numeros: as paginas sao Server Components.

## Investigacao

Variantes medidas (build de producao, rota `/`):

| Variante | JS gzip |
| --- | --- |
| baseline (`cacheComponents`, sem `partialPrefetching`) | 135,4 KB |
| `partialPrefetching: true` | 135,4 KB |
| `partialPrefetching: false` | 135,4 KB |
| `cacheComponents: false` | 135,1 KB |

As flags nao mexem no tamanho. Todas as rotas compartilham os mesmos chunks
(456 KB cada), entao `next/link` tambem nao e a causa: o router do App Router
e enviado de qualquer jeito. React-dom + cliente do Next ja somam ~115 KB.
Reduzir de verdade exigiria sair do App Router (fora do escopo, ADR 0007).

## Decisao

1. `budgets.js_initial_kb` passa de **120 para 140 KB**: piso medido (~135,5)
   mais ~4 KB de folga. Foi a menor alta possivel; escolhida por ser a mais
   conservadora em performance. `onExceed` continua `fail`.
2. O limite vale como **trava de regressao**: qualquer JS de loja (ilhas client
   das Fases 4-6) precisa caber nos ~4 KB de folga ou reduzir outra coisa. Se
   nao couber, a Fase 4 reabre este ADR com numeros reais; a primeira resposta
   deve ser cortar `"use client"`, nao subir o limite de novo.
3. `rendering.partialPrefetching: true` explicito no manifest, lido por
   `next.config.ts` (resolve o aviso do Next 16.4; recomendado para projetos
   novos; sem efeito medido em bytes).
4. CLAUDE.md, README e o gate da Fase 4 no ROADMAP foram atualizados para 140.

## Consequencias

- CI da Fase 0 passa a poder ficar verde no budget de JS.
- Folga de ~4 KB e proposital: o risco real e a Fase 4 (header/footer/minicart).
- Como o limite saiu do patamar original de 120, vale conferir Lighthouse
  (LCP/INP p75 mobile) assim que houver rota real; o gate de CWV continua o
  mesmo.

## Atualizacao (2026-11-10): de onde vem os 139,4 KB e por que nao mexer agora

Medido no build da branch do PR #28 (`.next/diagnostics/route-bundle-stats.json`,
gzip nivel 9). As seis rotas criticas carregam exatamente os mesmos 7 chunks:

| Chunk | gzip |
| --- | --- |
| react-dom (+ scheduler) | 70,1 KB |
| cliente/router do Next | 45,5 KB |
| compilado do Next | 7,7 KB |
| runtime do Turbopack | 3,8 KB |
| demais chunks do router | 5,1 KB |
| **ilhas da loja + um pedaco do router** | **7,2 KB** |

Total 139,4 KB; folga de 0,6 KB. O codigo de loja e ~3,9 KB.

- O chunk de 7,2 KB contem so as ilhas em uso (Tabs, Carousel,
  VariantSelector, AddToCartForm, PromoBar e OverlayTrigger). Modal, Toast e
  Radio, que nenhuma tela usa, **nao** estao nele: o barrel de `@nears/ui` ja
  e podado. Nao ha codigo morto para cortar.
- As ilhas vao juntas para todas as rotas porque todas compartilham o mesmo
  grafo de modulos (o registry importa todas as sections). Separar por rota
  exigiria carregar sections sob demanda no registry (ADR 0006/0012). Ganho
  maximo estimado: ~1 KB por rota, porque header e barra promocional sao
  globais e ficam.
- `packages/sections` nao depende do Next; usar `next/dynamic` ali acoplaria
  o pacote ao framework.

**Decisao:** o limite continua em 140 KB e nada muda no codigo. A proxima
ilha de cliente que nao couber nos 0,6 KB reabre este ADR com a opcao de
carregar sections por rota no registry; subir o limite continua sendo a
ultima resposta.
