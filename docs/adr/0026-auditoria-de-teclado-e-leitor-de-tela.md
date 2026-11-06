# ADR 0026 - Auditoria final de acessibilidade por teclado e leitor de tela

Status: aceita (Fase 8)

## Contexto

O gate de acessibilidade (WCAG 2.2 AA, `CLAUDE.md`) já tinha o axe em todas as stories e em
rotas de E2E. O axe confere regras estáticas do DOM; não vê a ordem real do foco, o que
acontece dentro de um overlay, as setas num `radiogroup` nem o que muda sob
`prefers-reduced-motion`. `nears.config.yaml > accessibility` exige `keyboardPathRequired` e
`reducedMotionRequired`, e a Fase 8 pede a auditoria final.

## Decisão

`e2e/keyboard.spec.ts` (projeto `chromium`; precisa de JavaScript) e um teste a mais em
`e2e/flow.spec.ts` (por preset) cobrem, em home, coleção, PDP e busca:

- **Skip link:** é o primeiro Tab, fica visível ao receber foco e Enter leva o foco a `#conteudo`.
- **Foco visível:** 30 Tabs na home; cada elemento focado mostra `outline` ou `box-shadow`
  (ou, em radio/checkbox `sr-only`, o irmão `peer` mostra).
- **Overlays (menu e filtros):** abrem por teclado, o foco circula dentro do `<dialog>` modal
  (nunca cai na página atrás), Esc fecha e o foco volta ao botão que abriu.
- **Compra só com teclado:** Enter no botão adiciona; o resultado é anunciado em
  `aria-live="polite"` sem roubar o foco. Nos presets, as setas movem a seleção dentro do
  `radiogroup` e nunca param numa opção `disabled`.
- **Reduced motion:** com `reducedMotion: reduce`, nenhum elemento tem animação ou transição
  acima de 10 ms nem `scroll-behavior: smooth`.
- **Leitor de tela:** um `banner`, um `main` e um `contentinfo` por rota; `navigation` com nome
  quando há mais de uma; um H1 e headings sem pular nível; árvore de acessibilidade da home
  com os marcos e o carrinho nomeado.

## O que a auditoria encontrou

1. **O skip link não era o primeiro item focável.** Ficava dentro do `Header`, depois da
   `PromoBar`, cujo link e botão "Dispensar aviso" recebiam o foco antes (WCAG 2.4.1/2.4.3).
   Correção: `SkipLink` virou um componente exportado e o layout o renderiza antes da
   `PromoBar`, com `skipLink={false}` no `Header` (nova prop, default `true`, então o Header
   isolado e as stories não mudam).

Os demais comportamentos já estavam corretos e agora têm teste.

## Limites

- Não substitui teste manual com NVDA, JAWS ou VoiceOver. O E2E garante nomes, papéis, ordem e
  anúncios na árvore de acessibilidade; a experiência de fala de cada leitor se confere à mão
  antes de uma loja ir ao ar (roteiro mínimo: skip link, menu, filtros, escolha de variação,
  adicionar ao carrinho e o anúncio).
- No `<dialog>` modal, depois do último elemento o Tab passa pela interface do navegador
  (`activeElement = body`). É o comportamento nativo; o teste só proíbe cair na página atrás.
