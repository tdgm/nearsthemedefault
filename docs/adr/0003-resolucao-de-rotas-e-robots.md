# ADR 0003 - Resolução de rotas ambíguas e robots.txt por segmento

- Status: aceito
- Data: 2026-11-03

## Contexto

**Rotas.** `routes.manifest.yaml` tem padrões com a mesma forma de URL:

| Forma | Padrões que disputam |
| --- | --- |
| `/{x}` | `department`, `category-flat`, `campaign`, `institutional` |
| `/{x}/{y}` | `department-category`, `category-flat-attribute`, `campaign-segment` |

O manifest não dizia quem vence. Tentar um padrão após o outro custaria um
fetch por tentativa no servidor, somando TTFB (meta: 400ms), e o resultado
dependeria da ordem de declaração.

**Robots.** O `Disallow` do robots.txt casa por prefixo. A lista
`/s*`, `/carrinho*`, `/login*`, `/account*` bloqueava URLs legítimas:
`/saias`, `/sofas`, `/smartphones`, `/sobre`, `/carrinho-de-bebe`,
`/accountability`. O mesmo erro estava em `forbiddenInProduction` (`/test*`
proibiria `/testes-de-gravidez` numa farmácia).

## Decisão

### Resolução por índice de slugs

- Segmentos literais vencem sempre: `/s`, `/b/...`, `/mapa-do-site`, `/404` e
  `/{x}/p` (PDP).
- O **1º segmento** é procurado num índice gerado no build e revalidado por
  ISR (300s), que mapeia `slug -> fonte`. Fontes: departamentos (CMS), tipos de
  produto (catálogo), campanhas (CMS) e páginas institucionais (CMS).
- **Unicidade:** um slug de 1º segmento pertence a uma única fonte. Publicar um
  slug que já existe em outra fonte falha o build (`onConflict: fail-build`).
  A ordem das fontes é irrelevante para o resultado.
- O **2º segmento** só é procurado na fonte que o 1º indicou
  (`department -> department-category`, e assim por diante).
- Slug fora do índice retorna status 404 real, nunca soft 404.
- Slugs reservados no 1º segmento: `s, b, p, mapa-do-site, 404, api, account,
  carrinho, checkout, login, preview, quick-view, design-system, test, teste,
  qa`. No 2º segmento, `p` é reservado (sempre PDP).

### Robots e rotas proibidas por segmento

- `excluded.disallowSegments` lista só nomes de segmento. O gerador da Fase 7
  emite três linhas exatas por segmento: `/{seg}$`, `/{seg}/` e `/{seg}?`.
- `excluded.disallowPrefixes` só aceita prefixos terminados em `/`.
- `forbiddenInProduction.segments` usa a mesma semântica.
- Todo segmento de `disallowSegments` e `forbiddenInProduction` precisa estar
  em `resolution.reserved.firstSegment`. O schema da Fase 2 valida isso.

## Verificação

Simulação da semântica de casamento do Google sobre a lista nova: 15 URLs
privadas bloqueadas, 13 públicas liberadas, 6 casos de `forbiddenInProduction`
corretos. Das públicas, 10 eram bloqueadas por engano pela lista antiga.

## Consequências

- Um lookup por request no lugar de N tentativas.
- CMS e catálogo precisam validar unicidade de slug na publicação. Na Fase 6,
  isso é feito pelo build; numa fase futura, também na interface do CMS.
- O slug de busca `s` deixa de ser usado por qualquer departamento ou
  categoria.
