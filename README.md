# nearsthemedefault

Template padrao white-label da plataforma **Nears**. E a base de front-end de
todas as lojas criadas na plataforma, de qualquer nicho de varejo online:
design system, arquitetura de sections, Core Web Vitals, SEO e GEO.

Nao e um site unico e nao assume nicho. Nada de identidade visual nem de
segmento vive no codigo:

| Para trocar... | Edite |
| --- | --- |
| Marca (cor, fonte, raio, espaco, midia) | `packages/tokens/tokens.json` |
| Nicho (variacoes, facetas, atributos, microcopy) | `catalog` e `vocabulary` em `nears/nears.config.yaml` |
| Estrutura de paginas e URLs | `nears/sections.registry.yaml` e `nears/routes.manifest.yaml` |

Presets prontos para moda, eletronicos, casa, beleza, mercado e pet em
[docs/adr/0002-template-multinicho.md](./docs/adr/0002-template-multinicho.md).
Fontes: so open source (OFL/Apache), self-hosted, com fallback websafe -
[docs/adr/0001-tipografia-open-source.md](./docs/adr/0001-tipografia-open-source.md).

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
| `nears/nears.config.yaml` | Catalogo por nicho, vocabulario, budgets e politica de terceiros |
| `nears/routes.manifest.yaml` | Mapa de URLs, canonical, facetas e indexacao |
| `nears/sections.registry.yaml` | Catalogo de blocos com props, CWV e a11y |
| `nears/contracts.yaml` | Contratos de dados, SEO e GEO por template |
| `packages/tokens/tokens.json` | Design tokens com valores concretos e contrastes medidos |
| `.github/workflows/ci.yml` | Cinco jobs: validate, test, budgets, lighthouse, e2e |
| `lighthouserc.json` | Assercoes de Core Web Vitals |
| `scripts/check-budgets.mjs` | JS/CSS/HTML estatico por rota (lido de `routes.manifest.yaml > appRoute`) |
| `scripts/check-third-party-hosts.mjs` | Conta hosts de terceiros distintos no relatorio do Lighthouse CI |
| `.github/dependabot.yml` | Mantem dependencias (npm/pnpm) e GitHub Actions atualizadas |
| `docs/adr/` | Decisoes de arquitetura (tipografia, multinicho, rotas e robots, contraste, enforcement de budgets, composicao de sections, Next.js 16, seguranca de CI) |

## Orcamentos

Fonte unica de verdade: `nears/nears.config.yaml`. O CI falha se estourar.

| Metrica | Limite |
| --- | --- |
| JS inicial (rota critica) | 140 KB gzip (ver docs/adr/0010) |
| CSS inicial | 30 KB |
| HTML | 80 KB |
| Requisicoes iniciais | 40 |
| Hosts de terceiros | 8 |
| JS de terceiros | 80 KB |
| LCP / INP / CLS / TTFB (p75 mobile) | 2.0s / 200ms / 0.05 / 400ms |
| Lighthouse mobile (perf / a11y / seo) | 90 / 95 / 100 |

## Seguranca

`pnpm audit`, scanner de segredos (gitleaks) correm no CI e o CodeQL roda pelo default
setup do GitHub, desde a Fase 0, mesmo em repo vazio. Headers de seguranca (CSP, HSTS, etc.) vem de
`nears.config.yaml > security`, nunca hardcoded em componente. Detalhe
completo em
[docs/adr/0008-seguranca-de-cadeia-de-suprimentos-e-ci.md](./docs/adr/0008-seguranca-de-cadeia-de-suprimentos-e-ci.md).

## Decisoes em aberto

Tres pontos dependem de decisao de negocio antes do go-live:

- **`geo.agents`** em `nears/contracts.yaml`: quais crawlers de IA permitir.
  Quase tudo esta como `decide` de proposito.
- **`onMissingGeoField`**: hoje `warn-build`. Deve virar `fail-build` ao fim
  da Fase 7, senao schema incompleto vira divida permanente.
- **`security.multiTenancy.allowlistSource`** em `nears/nears.config.yaml`:
  como o frontend valida o dominio personalizado de cada loja contra uma
  lista de dominios verificados pelo painel, antes de rotear (evita host
  header injection / cache poisoning). Mecanismo exato fica para a Fase 6.

## Padrao arquitetural

Storefront headless com paginas compostas por sections versionadas no CMS,
navegacao em multiplos eixos, landings de cauda longa e linkagem interna
programatica. Nenhuma identidade visual, texto, imagem ou codigo de terceiros
faz parte do template.
