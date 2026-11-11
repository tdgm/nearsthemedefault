# 0037 - Header e menu no layout V1 da Nears

## Status

Aceita.

## Contexto

A paleta V1 entrou nos tokens (ADR 0036), mas o layout continuou o antigo.
A proposta aprovada no canvas tem header em duas linhas no desktop: logo, busca
em pilula e conta/favoritos/sacola na primeira; barra de departamentos com
sublinhado de acao e mega-menu em largura total na segunda.

## Decisao

1. **Desktop (`lg:`)**: linha 1 com 80px (logo, busca em pilula com botao de
   acao, conta, favoritos, carrinho em laranja) e linha 2 com 52px
   (`nav aria-label="Departamentos"`), item com sublinhado `border-action` no
   hover/aberto. O mega-menu continua `<details>` nativo (ADR 0033), agora
   ancorado no `<header>` (`lg:relative`) em largura total, com grupos em grade
   e um cartao de destaque/promo. Nenhum schema novo alem do rotulo `labels.nav`.
2. **Mobile**: uma linha so de 56px, sticky (hamburger, logo, busca, conta,
   carrinho), como antes.
3. **Sticky**: no desktop o header deixa de ser sticky (`sticky lg:relative`):
   duas linhas somam 132px e roubariam viewport. `cwv.reservedHeight` segue 56
   (a regiao sticky); no desktop o header rola com a pagina.
4. **NavDrawer**: departamento aberto vira laranja com texto escuro
   (`group-open:bg-action`), itens com raio e espacamento no lugar de divisores.
   Fundo marinho do drawer fica para um PR proprio (exige variante no `Overlay`).

## Custo

Sem JS novo e sem dependencia: so classes Tailwind e markup server-side.
JS e CSS iniciais conferidos no CI (`check-budgets`).
