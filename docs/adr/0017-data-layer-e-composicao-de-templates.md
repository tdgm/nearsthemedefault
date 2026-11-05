# ADR 0017 - Data layer, indice de slugs e composicao de templates (Fase 6a)

- Status: aceito
- Data: 2026-11-05

## Contexto

A Fase 6 troca os placeholders por templates reais. Antes de montar home, colecao
e PDP e preciso uma fonte de dados unica, validada, e uma forma de compor paginas
que nao duplique o que ja esta em `nears/sections.registry.yaml > templates`.

## Decisao

1. **Data layer validado.** `apps/web/lib/data/client.ts` e a unica porta de dados do
   app. Hoje serve um mock neutro (`mock.ts`); a resposta, mock ou GraphQL, passa por
   `catalogSnapshotSchema` (Zod) antes de chegar a qualquer section. `graphql.ts` e o
   transporte (POST, `revalidate` do manifest, token so no header, resposta fora do
   contrato falha alto). As queries reais entram quando o backend publicar o schema;
   ate la o cliente nao chama a rede. Endpoint e credencial serao variaveis server-only.
2. **Indice de slugs com falha no build.** `buildSlugIndex` (puro) recebe os slugs de
   department, category-flat (so se `catalog.flatAxis.enabled`), campaign e
   institutional, mais os reservados do manifest, e lanca `SlugIndexError` listando
   todo conflito. `getSlugIndex()` o monta a partir do data layer. Reservado casa por
   segmento exato (`saias` nao colide com `s`).
3. **Composicao dirigida pelo manifest.** `expandTemplate` expande
   `templates.<id>.sections` (incluindo `id:variante` e `repeat`) em instancias
   ordenadas; `repeatCountsFor` aplica o `limit` (numero ou `from: caminho.na.config`).
   `renderInstances` valida as props de cada instancia com o `schema` da section e
   renderiza o componente. Nenhuma lista de sections e escrita a mao nas paginas: mudar
   a ordem e mudar o YAML. Tudo roda no servidor; a composicao nao adiciona JS.
4. **Conteudo provisorio.** `home-content.ts` entrega props por instancia (o que o CMS
   fara). Os textos sao neutros; o que varia por nicho vem de `vocabulary`/`catalog`.
5. **Home.** `<h1>` unico e o nome da loja (somente leitores de tela: o hero e a
   identidade visual). O painel de evolucao deixou de ser a home e aparece recolhido
   apenas fora de producao (`process.env.NODE_ENV`, resolvido em build).
6. **Dependencia.** `zod` entra em `apps/web` (ja usado em `@nears/manifests` e
   `@nears/sections`): 0 KB novos no cliente, so servidor.

## Imagens

Os mocks usam SVGs em `public/placeholders/`. A transformacao AVIF/WebP por CDN
(`<picture>` com varias fontes) depende do provedor de imagem da loja e fica para o
momento em que `integrations` definir o provedor; `ArtImage` ja reserva
`width`/`height` e usa `fetchpriority` so no candidato a LCP.

## Consequencias

- Trocar o mock por GraphQL nao toca em rotas nem sections.
- Slug duplicado ou reservado quebra testes e, a partir de 6b, o `generateStaticParams`.
- A home depende de `featuredDepartments`: ate esse numero ganham bloco; os demais
  ficam no nav-drawer e no mapa do site.
