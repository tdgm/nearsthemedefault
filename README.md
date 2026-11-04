# nearsthemedefault

Template padrao white-label da plataforma **Nears**. E a base de front-end de
todas as lojas criadas na plataforma: design system, arquitetura de sections,
Core Web Vitals, SEO e GEO.

Nao e um site unico. Trocar de marca significa trocar `tokens.json` e os
manifests em `/nears` - nada de identidade visual vive no codigo.

## Por onde comecar

1. Leia **[CLAUDE.md](./CLAUDE.md)** - regras inviolaveis do projeto.
2. Leia **[docs/ROADMAP.md](./docs/ROADMAP.md)** - oito fases com gates.
3. Abra o Claude Code na raiz e cole o prompt de kickoff de
   **[docs/PROMPTS.md](./docs/PROMPTS.md)**.

## O que ja existe

| Caminho | O que e |
| --- | --- |
| `CLAUDE.md` | Memoria persistente: stack, budgets, a11y, SEO/GEO, definition of done |
| `docs/ROADMAP.md` | Fases 0 a 8 com entregavel e gate de cada uma |
| `docs/PROMPTS.md` | Prompt de kickoff e prompts de continuacao por fase |
| `nears/nears.config.yaml` | Identidade, tokens, budgets e politica de terceiros |
| `nears/routes.manifest.yaml` | Mapa de URLs, canonical, facetas e indexacao |
| `nears/sections.registry.yaml` | Catalogo de blocos com props, CWV e a11y |
| `nears/contracts.yaml` | Contratos de dados, SEO e GEO por template |
| `packages/tokens/tokens.json` | Design tokens com valores concretos e contrastes medidos |
| `.github/workflows/ci.yml` | Cinco jobs: validate, test, budgets, lighthouse, e2e |
| `lighthouserc.json` | Assercoes de Core Web Vitals |
| `scripts/check-budgets.mjs` | Falha o build quando o bundle estoura o limite |

## Orcamentos

Fonte unica de verdade: `nears/nears.config.yaml`. O CI falha se estourar.

| Metrica | Limite |
| --- | --- |
| JS inicial (rota critica) | 120 KB gzip |
| CSS inicial | 30 KB |
| HTML | 80 KB |
| Requisicoes iniciais | 40 |
| Hosts de terceiros | 8 |
| JS de terceiros | 80 KB |
| LCP / INP / CLS / TTFB (p75 mobile) | 2.0s / 200ms / 0.05 / 400ms |
| Lighthouse mobile (perf / a11y / seo) | 90 / 95 / 100 |

## Decisoes em aberto

Dois pontos dependem de decisao de negocio antes do go-live:

- **`geo.agents`** em `nears/contracts.yaml`: quais crawlers de IA permitir.
  Quase tudo esta como `decide` de proposito.
- **`onMissingGeoField`**: hoje `warn-build`. Deve virar `fail-build` ao fim
  da Fase 7, senao schema incompleto vira divida permanente.

## Referencia estrutural

A arquitetura foi derivada da analise de um e-commerce de moda em larga escala
(VTEX FastStore + Next.js, ~18 mil URLs indexaveis, composicao por sections
versionadas no CMS). Replicamos o **padrao estrutural**, nunca identidade
visual, textos, imagens ou codigo de terceiros.
