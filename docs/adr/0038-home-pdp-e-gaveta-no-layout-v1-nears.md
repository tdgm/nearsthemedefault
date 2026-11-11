# 0038 - Home, cards, PDP e gaveta no layout V1 da Nears

## Status

Aceita.

## Contexto

Continuacao do ADR 0036 (paleta) e 0037 (header/menu): leva o resto da V1
aprovada no canvas para as sections, sem mudar schema nem conceito de nicho.

## Decisao

1. **Tokens**: `radius.xl` 16px e `radius.2xl` 24px (o tema zera os raios padrao
   do Tailwind); semanticos `tint-a..d` (brand.100, navy.100, brand.200,
   navy.200) com texto `on-tint` (neutral.900), iguais nos dois temas porque
   sao superficies claras; `typography.weight.heading` 400 -> 700.
2. **Hero**: cada slide ganha, quando tem `headline`/`cta`, um painel
   `surface-brand` ao lado da arte (`lg:`, grade 5fr/6fr) ou abaixo (mobile).
   Arte e LCP continuam iguais (eager + fetchpriority no 1o slide).
3. **CategoryHub**: cards em blocos `tint-*` alternados por posicao (sem
   depender do nicho), 3 colunas no desktop.
4. **BenefitBar**: itens como cards com borda; **EventBanner**, **BannerGrid**,
   **ProductCard** e **PdpGallery**: cantos `xl`/`2xl`; titulo de secao maior.
5. **Gaveta (NavDrawer)**: `Overlay` ganha `tone="brand"` (fundo marinho,
   texto `on-brand`). Os links do drawer viram `<a>` herdando a cor, porque o
   `Link` fixa `text-link` (marinho) e sumiria no fundo marinho.

## Nao feito

Hero como composicao "texto + tiles de produto" da V1 exigiria um schema novo
(tiles no hero): fica fora, o painel + arte entrega a mesma leitura com o
schema atual. Fonte Bricolage segue nao adotada (ADR 0036).

## Custo

Sem dependencia nem JS novo. Contrastes `on-tint` entram em
`contracts.yaml`; `check-budgets` no CI.
