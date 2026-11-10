# 0033 - Header/menu no padrao estrutural da Hering e ritmo de espacamento

## Status

Aceita.

## Contexto

Pedido: deixar os elementos do site (Header, menu etc.) mais parecidos com o
`hering.com.br` **estruturalmente** - o proprio projeto ja cita esse site como
referencia de arquitetura de componentes (`nears.config.yaml`/descricao do
projeto), com a regra explicita de nunca copiar marca, cor, tipografia, texto
ou imagem, so o padrao de composicao. E tambem ajustar o espacamento entre os
elementos do site, hoje inconsistente.

Medido ao vivo na Hering (desktop 1440px, via DOM, sem salvar nada de marca):

- Header: container centralizado de 1296px (72px de gutter de cada lado),
  64px de altura; logo **a esquerda**, grupo logo+nav com `gap: 40px`, nav de
  departamentos (`Novidades, Feminino, Masculino, Sports, Teen, Kids, Saldos`)
  inline ao lado do logo com `gap: 32px` entre os links - nao atras de
  hamburger. Passar o mouse sobre um departamento abre um painel mega-menu
  full-width com colunas por grupo (`Roupas`, `Linhas`, `Intimates`...) e um
  CTA ao fim.
- Ritmo vertical entre secoes da Home (medido secao a secao, do fim de uma ao
  inicio da proxima): **80px e o gap dominante** (bannerFull→eventBanner,
  eventBanner→bannerGrid, bannerGrid→eventBanner, widget→footer, todos 80px);
  **40px aparece so em pares justos** (hero→benefit-bar logo abaixo dele,
  textSEO→relatedLinks no rodape de conteudo).

No nosso codigo:

1. O `Header` centralizava o logo e escondia os departamentos inteiros atras
   do hamburger/`NavDrawer` (off-canvas) em **qualquer** breakpoint - nao
   existia nav visivel no desktop.
2. O espacamento vertical entre secoes era o `py-4`/`py-6`/`py-8` que cada
   componente escolhia por conta propria (sem padrao: 16px, 24px ou 32px
   junto com o `py` do vizinho), e alguns full-bleed (`event-banner` sozinho
   na Home) nao tinham espacamento NENHUM - secoes se tocavam diretamente. O
   bloco galeria+buybox da PDP tambem nao tinha espaco algum antes do bloco de
   frete/detalhes.

## Decisao

### 1. Header: logo a esquerda + nav inline com mega-menu, so a partir de `md:`

`packages/sections/src/header/header.tsx` passa a agrupar logo + nav de
departamentos a esquerda (controle do mesmo `nav.departments` que o
`NavDrawer` ja consome - **nenhum schema novo**), com busca/conta/favoritos/
carrinho agrupados a direita. O hamburger (abre o `NavDrawer`) so aparece
abaixo de `md:`.

O mega-menu por departamento (`DepartmentMenu`, novo, dentro do proprio
`header.tsx`) usa `<details>/<summary>` nativo - a MESMA tecnica que o
`NavDrawer` ja usa pros niveis internos - e abre por **clique**, nao por
hover. Essa e a unica divergencia deliberada do padrao Hering (que abre por
hover): um mega-menu que abre por hover com `<details>` nao tem como existir
sem JS controlando estado, e simular hover em CSS puro (`opacity`/
`visibility` em vez do atributo `open`) deixa o painel sempre no DOM "visivel
pra acessibilidade" mesmo fechado - um leitor de tela em modo de leitura
linear (sem simular foco/hover) leria todos os links de todos os
departamentos de uma vez. `<details>` fechado sai de verdade da arvore de
acessibilidade (o navegador cuida disso) e mantem o Header Server Component
(zero JS novo). Trade-off aceito e documentado no proprio componente: abrir
um departamento nao fecha os outros sozinho (nao ha JS pra isso).

Alternativa descartada: Radix `NavigationMenu` (permitido pelo CLAUDE.md pra
"overlay/menu") resolveria o hover com estado certinho, mas e `"use client"` -
viraria JS na rota critica em toda pagina com header (todas), contra o
orcamento de 140KB. Native `<details>` ganhou por ser mais conservador em
performance.

O nav inline (e o hamburger que ele substitui) so aparece a partir de `lg:`
(1024px), nao `md:` (768px): com ~6 departamentos + busca + conta/favoritos/
carrinho, 768px e estreito demais pra caber tudo numa linha sem quebrar -
tablet continua com o hamburger/`NavDrawer`, mais conservador que arriscar
overflow num breakpoint intermediario.

### 2. Espacamento: `mb-20` (80px, token `space.20` ja existente) como ritmo padrao

Cada secao "empilhavel" (as que entram em `templates.<x>.sections` e ficam
uma embaixo da outra) passa a carregar sua propria `mb-20`, substituindo o
`py-*` ad-hoc que tinha (ou a ausencia dele). Margem so de um lado (nunca
`mt-*` tambem) evita o colapso de margem entre blocos irmaos - cada limite
tem exatamente UMA margem contribuindo, sem duvida de calculo. Nenhum token
novo: `space.20 = 5rem = 80px` e `space.10 = 2.5rem = 40px` ja existiam em
`packages/tokens/tokens.json`.

Arquivos tocados (so a classe de espacamento vertical; container horizontal,
`content-visibility`/`contain-intrinsic-size` e espacamento interno de
conteudo ficam como estavam): `hero.tsx`, `benefit-bar.tsx`, `banner-grid.tsx`,
`category-hub.tsx`, `showcase.tsx`, `event-banner.tsx`, `banner-full.tsx`,
`related-links.tsx`, `faq.tsx`, `product-grid.tsx`, `pdp-details.tsx`,
`pdp-reviews.tsx`, `pdp-bundle.tsx`, `pdp-related.tsx`, e o wrapper
galeria+buybox em `apps/web/lib/templates/pdp.tsx` (que nao tinha espacamento
nenhum antes do bloco de frete/detalhes).

Excecoes, todas com motivo proprio:

- **`section-title.tsx`** perde o `pt-8` que tinha (o espaco de cima agora
  vem do `mb-20` da secao anterior) e mantem so `pb-4` - justo com o
  conteudo que o titulo introduz, que e o efeito desejado (titulo cola no que
  titula, separa do que veio antes).
- **`text-seo.tsx`** usa `mb-10` (40px), nao o padrao de 80px: e o mesmo
  numero que a Hering usa pros seus pares justos, e o proprio CLAUDE.md ja
  chama TextSEO+RelatedLinks de **par** ("o par TextSEO + RelatedLinks ao fim
  de todo template") - a unica excecao com base dupla (medicao + doutrina
  propria do projeto). Ressalva: na Home e no PLP, `faq` hoje fica ENTRE
  `text-seo` e `related-links` na composicao (`sections.registry.yaml`), entao
  nesses dois templates o `mb-10` separa `text-seo` do FAQ, nao do
  RelatedLinks diretamente - a reordenacao de secoes e um assunto a parte
  (nao mexido aqui); nos templates `landing` e `page`, onde os dois ja sao
  vizinhos, o efeito de par-justo vale como descrito.
- **`breadcrumb.tsx`** ganha `mb-4` (16px): e justo com o titulo/H1 logo
  abaixo, nao com o ritmo geral entre secoes de conteudo.
- **`footer.tsx`** troca `mt-12` (48px) por `mt-20` (80px), pra fechar com o
  mesmo ritmo do resto do site antes do rodape (que ja tem borda e fundo
  proprios como separador visual, independente da margem exata).
- **`quick-filter.tsx`** fica como esta (`py-2`, intencionalmente): e uma
  faixa de chips coladas no `product-grid` logo abaixo, nao um "elemento do
  site" separado no mesmo sentido dos demais - dar 80px de distancia ali
  pareceria quebrado, nao organizado.
- **`pdp-buybox.tsx`**/**`pdp-gallery.tsx`** nao mudam: ficam lado a lado
  (grid, nao empilhados) e o espaco entre eles e horizontal (`lg:gap-10` no
  wrapper em `pdp.tsx`), nao vertical.

## Consequencias

- Gap visual entre a maioria das secoes do site (Home, PLP, corpo da PDP)
  passa de algo entre 16px-48px (ou 0, nos banners full-bleed) pra um
  **80px consistente**; mais parecido com o ritmo medido na Hering e mais
  folga visual em geral.
- Nenhum token novo, nenhuma mudanca de schema/manifest - so a classe
  Tailwind de espacamento muda por componente.
- `Header` ganha ~70 linhas (o `DepartmentMenu`) e deixa de ser so
  "logo + hamburger + icones": quem tem `nav.departments` com `groups`/
  `highlight`/`promo` ganha um mega-menu visivel no desktop sem precisar de
  nenhuma config nova.
- Mega-menu abre por clique, nao hover (ver secao 1) - documentado no
  componente pra nao ser "corrigido" de volta pra hover sem essa ressalva.
- `pnpm tokens:build`/`tokens:contrast` nao mudam (nenhum token de cor ou
  espacamento foi criado ou alterado, so reaproveitado).
