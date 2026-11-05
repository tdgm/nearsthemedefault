# ADR 0018 - Colecoes, landing, pagina institucional e resolucao de rotas (Fase 6b)

- Status: aceito
- Data: 2026-11-05

## Contexto

As rotas de um, dois e tres segmentos (`/[slug]`, `/[slug]/[sub]`, `/[slug]/[sub]/[subsub]`)
servem varias fontes (departamento, tipo de produto, campanha, pagina institucional).
`cacheComponents` obriga a ler `searchParams` dentro de `Suspense`, o que transmite o
conteudo por stream e o esconde de quem esta sem JavaScript.

## Decisao

1. **Resolucao por indice.** `resolveSegments` consulta o indice de slugs uma vez (ADR 0003
   e 0017) e so procura o 2o e o 3o segmento na fonte do 1o. Fora do indice devolve `null`;
   a pagina chama `notFound()` e o Next responde 404 de verdade. `generateStaticParams` de
   cada rota lista todos os caminhos conhecidos, entao slug duplicado ou reservado derruba
   o build antes de publicar.
2. **Shell estatico + resultado dinamico.** A colecao renderiza, dentro do `Suspense`, a
   versao SEM filtros (pagina 1, ordenacao padrao) como `fallback`. Esse shell vai no HTML
   estatico e e o que crawlers e usuarios sem JS recebem. Com `?page`, `?sort` ou filtros
   o resultado correto substitui o shell no stream. Limite conhecido: sem JS, uma URL
   com query mostra o shell da pagina 1; a Fase 7 decide se paginas indexaveis passam a
   ter segmento de caminho proprio.
3. **H1 pela section.** `section-title` ganhou `level: h1` (usado so em collection, search,
   sitemap e notfound). Home, landing e pagina institucional tem H1 proprio no template.
4. **Campanha fora da janela redireciona** (`campaign.schedule.onExpire`). O "agora" e dado
   de requisicao, entao a checagem roda atras de `connection()` dentro de `Suspense`; o
   shell estatico mostra a landing ativa e o redirecionamento acontece no stream.
5. **Eixo plano nivel 2** (`/{tipo}/{valor}`) continua desligado: so existe com
   `catalog.flatAxis.secondLevelAttribute`, e o mock nao define atributo.
6. **Facetas por vocabulario.** O rotulo de cada faceta vem de `vocabulary.facet<Id>`
   (`facetBrand`, `facetPrice`...); sem a chave, usa o proprio id.
7. **Busca (`/s`).** Segue CSR/noindex. Com resultados mostra o `product-grid`; sem, os
   estados vazio e sem resultado ja existentes.
8. **Mapa do site.** Template `sitemap` ganhou um `related-links` final para tipos,
   campanhas e paginas (zero links orfaos).

## Consequencias

- Canonical, robots por faceta e JSON-LD seguem para a Fase 7; a Fase 6 so define titulo
  e descricao.
- O conteudo textual das colecoes (intro, FAQ) e provisorio e sai do CMS depois.
