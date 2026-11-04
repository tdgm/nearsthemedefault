# ADR 0004 - Contraste AA e tema escuro completo

- Status: aceito
- Data: 2026-11-03

## Contexto

O cálculo real de contraste (WCAG 2.x, luminância relativa) sobre
`tokens.json` mostrou:

- `on-surface-faint` e `price-list` (`neutral.500 #6F7A87`) com 4,37:1 sobre
  branco e 4,11:1 sobre `surface-subtle`, abaixo do mínimo de 4,5:1 para texto.
  A nota "apenas texto >= 18px" não resolvia: WCAG só considera texto grande a
  partir de 24px, ou 18,66px em negrito.
- `border` (1,33:1) e `border-strong` (1,68:1) não serviam como limite de
  input, checkbox ou radio, que exige 3:1 (WCAG 1.4.11).
- O tema escuro declarava só parte das chaves. Herdando do claro, `price`
  virava `neutral.900` sobre `neutral.900` (1:1, texto invisível).
- Os valores `contrast` anotados nos tokens não batiam com o cálculo (ex.:
  `on-surface` declarava 15,8:1 e mede 17,28:1).

## Decisão

1. `neutral.500` passa de `#6F7A87` para `#67717D`: mesmo matiz, levemente mais
   escuro. Mede 4,96:1 sobre branco e 4,66:1 sobre `surface-subtle`.
2. Novo token `border-control` (`neutral.500` no claro, `neutral.400` no escuro)
   para limites de controles. `border` e `border-strong` ficam documentados como
   decorativos e nunca podem ser o único limite de um controle.
3. Os temas `light` e `dark` declaram exatamente as mesmas chaves, sem herança
   implícita. O teste falha se as chaves divergirem.
4. Os números de contraste saem dos tokens. Os pares obrigatórios ficam em
   `contracts.yaml > gates.accessibility.contrastPairs` e são calculados por
   `pnpm tokens:contrast` (Fase 1), contra `surface`, `surface-subtle` e
   `surface-raised`, nos dois temas.

## Resultado

62 pares checados (31 por tema), todos passando. Menor folga:
`badge-promo-on / badge-promo-bg` com 4,54:1. Ao trocar o `accent` de uma marca,
esse é o par que quebra primeiro, e o teste vai acusar.

## Consequências

- Componentes de formulário (Fase 3) usam `border-control`, não `border`.
- Uma marca que troque a escala neutra precisa passar no mesmo teste; não há
  número de contraste para atualizar à mão.
