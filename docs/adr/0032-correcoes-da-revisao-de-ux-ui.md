# 0032 - Correcoes da revisao de UX/UI (tokens, toolbar do PLP e variacao de placeholder)

## Status

Aceita.

## Contexto

Revisao de design (`/design-critique`) na Home, no PLP (`/departamento-exemplo`)
e na PDP (`/produto-exemplo/p`), navegando de verdade no servidor de dev e
cruzando com `tokens.json`/`sections.registry.yaml`. Tres achados concretos:

1. **`link` e `price-sale`/`badge-promo-bg` resolviam para o mesmo hex.**
   `color.accent.*` era uma copia valor-por-valor de `color.brand.*`
   (`#B3410F` em ambos no tom 700), e os dois semanticos apontavam para o
   tom 700 do seu respectivo primitivo. Medido no DOM renderizado: breadcrumb,
   titulo do produto no card e o preco com desconto tinham todos
   `color: rgb(179, 65, 15)`. Resultado: nada na loja consegue sinalizar
   "isto esta com desconto" sem tambem parecer "isto e um link clicavel".
2. **Os botoes do toolbar do PLP** (`Filtrar`, `Ordenar`, `Aplicar filtros` em
   `packages/sections/src/product-grid/product-grid.tsx`) e o `quickAdd` do
   `ProductCard` eram `<button>` crus com `rounded-md`/`font-medium`
   hardcoded, nao o componente `Button` - ficaram de fora da migracao pra
   pilula (ADR 0031) porque nunca passaram pelo design system pra comecar.
3. **A ilustracao placeholder (circulo laranja/azul-marinho) se repete
   identica** em todo card de categoria, todo card de produto, e e reusada
   **integralmente** como arte de pelo menos dois banners diferentes na Home
   (Hero e o EventBanner seguinte). Sem nenhuma variacao, a pagina inteira
   parece usar a mesma imagem dezenas de vezes.

Achado relacionado, mas tratado a parte: `showcase:wishlist` aparecia sempre
vazio ("Você ainda não favoritou nenhum produto.") pra qualquer visitante da
Home. Investigando, a home e `render: ssg` (`routes.manifest.yaml`): o HTML e
o mesmo pra todo visitante, entao essa secao *nunca* poderia mostrar um
favorito de verdade, mesmo que o visitante tivesse itens salvos - ela sempre
mostraria o estado vazio, pra sempre. Isso nao e uma escolha de UX a discutir,
e uma inconsistencia com o proprio modelo de renderizacao da pagina.

## Decisao

### 1. `price-sale` e `badge-promo-bg` passam a apontar para `status.danger`

`color.accent` nunca foi referenciado por nenhum componente alem desses dois
semanticos (`grep` confirmou), entao nao e uma identidade visual perdida -
era so um alias de `brand` com outro nome. Duas saidas razoaveis:

- (a) dar a `accent` uma cor propria (nova decisao de marca, sem dado pra
  embasar qual tom), ou
- (b) reaproveitar `status.danger` (`#C0281F`), que ja existe, ja tem AA
  calculado nos dois temas via `pnpm tokens:contrast`, e e a convencao mais
  comum de e-commerce pra preco promocional.

Fomos de (b): mais conservador, zero cor inventada, contraste ja validado
(5,89:1 contra branco e 7,77:1 no tema escuro - ambos acima do minimo de
4,5:1 de texto). O primitivo `color.accent` foi removido do `tokens.json`
(nao ficou orfao). `link` continua em `color.brand.700`: agora `link` e
`price-sale` divergem de verdade.

### 2. Toolbar do PLP e quick-add do card migram pro `Button`/`buttonClasses`

`Filtrar` (via `OverlayTrigger` + `buttonClasses({ variant: 'secondary', size: 'sm' })`),
`Ordenar` e o quick-add do `ProductCard` (`<Button variant="secondary" size="sm">`),
`Aplicar filtros` (`<Button type="submit">`, variante primaria, ja que e a
acao de confirmar o drawer). Nenhuma mudanca de comportamento (mesmos
formularios GET/POST, mesmo texto, mesmos testes de role/nome) - so a classe
deixa de ser escrita a mao.

### 3. `showcase:wishlist` sai da composicao da Home

Removido de `templates.home.sections` em `sections.registry.yaml`. A
variante `wishlist` do `Showcase` continua declarada no registry e no schema
(outro template, ou uma ilha client-side pos-hidratacao na propria Home,
podem usa-la legitimamente no futuro) - so nao faz sentido numa pagina
`ssg`, onde o servidor nunca sabe quem esta visitando.

### 4. Variacao deterministica de matiz na arte placeholder

Novo `packages/sections/src/shared/illustration.ts`: `illustrationFilter(seed)`
faz um hash simples e estavel da string (ex.: o `href` do item) e escolhe
entre 6 receitas de `filter` CSS (`hue-rotate` +- ~30deg em torno da paleta
da marca, uma variante dessaturada, e a arte original). Aplicado no
`<Image>`/`<ArtImage>` via `style`, sem tocar nos arquivos de imagem:

- **Zero bytes de rede**: nenhuma imagem nova, so uma propriedade CSS que o
  navegador ja teria que compositar.
- **Zero risco de CLS**: `filter` nao afeta layout/dimensoes.
- **Determinismo**: a mesma semente sempre gera o mesmo filtro, em SSR e em
  qualquer re-render, sem JavaScript no cliente.
- **Faixa estreita de propósito**: as receitas ficam dentro de um range que
  mantem a ilustracao reconhecivel como "da mesma familia" (nunca vira verde-
  limao ou roxo), pra parecer variado, nao quebrado.

Aplicado em `ProductCard` (semente = `href` do produto) e `CategoryHub`
(semente = `href` da categoria). No `EventBanner`, que reaproveita a mesma
arte do `Hero`, a semente e o proprio `alt` da campanha - como `Hero` nao
aplica filtro nenhum (fica com a arte original/canonica) e o `alt` do
`EventBanner` e sempre um texto diferente do `Hero`, os dois nunca ficam
identicos entre si.

Alternativa descartada: gerar mais arquivos de imagem (ex.: 6 SVGs
diferentes). Custaria bytes reais e manutencao de asset por variante; o
filtro CSS resolve a monotonia visual pelo mesmo principio ja usado no
projeto (tokens, nao arquivos, carregam a variacao).

## Consequencias

- `pnpm tokens:build` precisa rodar de novo (muda `dist/tokens.css`,
  `dist/theme.css`, `dist/figma.tokens.json`) - nao editados a mao aqui.
- Quem olhar a PDP/PLP ve badges de oferta e preco promocional em vermelho
  (`status.danger`), nao mais na mesma cor dos links.
- `color.accent` deixou de existir como primitivo. Se um nicho futuro
  precisar de uma segunda cor de marca (alem de `brand` e dos `status.*`),
  ela entra como um primitivo novo e nomeado pelo papel que vai cumprir, nao
  reaproveitando `accent` do jeito que estava.
- A home nao mostra mais "Seus favoritos" pra ninguem. Quando a Fase de
  conta/sessao ganhar uma ilha client-side com fetch pos-hidratacao, essa
  secao pode voltar - como ilha, nao como conteudo estatico.
