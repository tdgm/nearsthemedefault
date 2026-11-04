# CLAUDE.md - nearsthemedefault

## O que e este projeto

Template padrao white-label da plataforma **Nears**: o front-end base de todas as
lojas criadas na plataforma, para **qualquer nicho de varejo online** (moda,
eletronicos, casa, beleza, mercado, pet...). Nao e um site unico. Tudo precisa
ser parametrizavel por tokens e por manifests declarativos, sem valores de marca
nem conceitos de nicho hardcoded.

Padrao arquitetural adotado: composicao de paginas por sections versionadas no
CMS, eixos multiplos de navegacao (departamento e tipo de produto), landings de
cauda longa e o par TextSEO + RelatedLinks ao fim de todo template. **Nunca**
copiamos identidade visual, textos, imagens ou codigo de terceiros.

Onde cada coisa muda:

- **Marca**: `packages/tokens/tokens.json` (cor, fonte, raio, espaco, midia).
- **Nicho**: blocos `catalog` e `vocabulary` de `nears/nears.config.yaml`
  (eixos de variacao, facetas, atributos GEO, microcopy). Presets em
  `docs/adr/0002-template-multinicho.md`.

## Stack obrigatoria

- Next.js 16 (App Router) + React 19 + TypeScript strict (docs/adr/0007-nextjs-16.md)
- Tailwind CSS 4 consumindo CSS custom properties (nunca cor literal em classe)
- Radix UI primitives apenas para overlay / menu / dialog / radiogroup
- Zod para validar todo manifest e toda resposta de API
- Storybook 8 + Vitest + Testing Library + Playwright + axe-core
- pnpm como package manager

Proibido sem perguntar antes: qualquer lib de UI pronta (MUI, Chakra, shadcn
completo), CSS-in-JS com runtime, lib de carrossel, moment/dayjs, lodash inteiro,
framer-motion na rota critica.

## Estrutura do repositorio

```
/apps/web                    app Next.js
  /app                       rotas (App Router)
  /lib                       data layer, seo, geo, analytics
/packages/tokens             tokens.json + build Style Dictionary
/packages/ui                 design system (atomos e moleculas)
/packages/sections           blocos de pagina (registry)
/nears                       manifests declarativos
  nears.config.yaml
  routes.manifest.yaml
  sections.registry.yaml
  contracts.yaml
/docs                        decisoes de arquitetura (ADRs)
/scripts                     validacao de budgets e manifests
```

## Regras inviolaveis

### Performance

Orcamentos aplicados no CI. Build falha se estourar. Fonte da verdade:
`nears/nears.config.yaml`.

| Metrica | Limite |
| --- | --- |
| JS inicial da rota critica | 140 KB gzip (era 120; ver docs/adr/0010) |
| CSS inicial | 30 KB |
| HTML | 80 KB |
| Requisicoes no load inicial | 40 |
| Hosts de terceiros | 8 |
| JS de terceiros | 80 KB |
| LCP / INP / CLS / TTFB (p75 mobile) | 2.0s / 200ms / 0.05 / 400ms |

Consequencias praticas:

- Toda imagem declara `width`/`height` ou `aspect-ratio`. Sem excecao.
- Acima da dobra: `<picture>` com AVIF + WebP, `fetchpriority="high"`, sem lazy.
  Abaixo da dobra: `loading="lazy" decoding="async"`.
- Carrossel usa scroll-snap nativo + `scrollIntoView`. Zero libs.
- Fonte: no maximo uma familia variavel **open source** (OFL ou Apache),
  self-hosted via `next/font/local`, woff2 subsetado, `font-display: swap`,
  preload so do peso 400. Fallback websafe (Arial/Times New Roman) com
  `size-adjust` calculado no build, nunca a mao. Modo `system` = zero download.
  Nunca CDN de fontes. Ver `docs/adr/0001-tipografia-open-source.md`.
- Secoes abaixo da dobra recebem `content-visibility: auto` com
  `contain-intrinsic-size` declarado.
- Script de terceiro nunca bloqueia render. Carrega via `afterInteractive`,
  `lazyOnload` ou Partytown. Cada um precisa de ADR justificando o custo.

### Acessibilidade

WCAG 2.2 AA e gate de merge, nao aspiracao.

- Alvo de toque >= 44x44px; foco visivel sempre; contraste testado automaticamente
- Seletor de variacao (cor, tamanho, voltagem, peso...) e `radiogroup`, nao
  lista de botoes
- Adicionar ao carrinho anuncia resultado em `aria-live="polite"`
- Drawer e modal com focus trap e fechamento por Esc
- `prefers-reduced-motion` respeitado em toda animacao
- 0 violacoes do axe em todas as stories e em todos os E2E

### SEO e GEO

- Todo conteudo indexavel existe no HTML inicial. Teste com JS desabilitado.
- Um H1 por pagina, hierarquia de headings sem pular nivel.
- JSON-LD gerado por helper tipado em `/lib/seo`, nunca escrito a mao no JSX.
- Schemas por template conforme `nears/contracts.yaml`. `Product` so e completo
  com `aggregateRating`, `shippingDetails` e `hasMerchantReturnPolicy`.
- Toda collection e toda PDP tem bloco de FAQ com `FAQPage`.
- Tabelas de especificacao, medidas, composicao ou informacao nutricional em
  HTML semantico. Nunca em imagem.
- Primeiro paragrafo de todo bloco de texto responde diretamente a pergunta do
  heading (otimizacao para motores generativos).
- `robots.txt` e `llms.txt` gerados a partir do manifest.

### Codigo

- TypeScript strict. `any` e erro de lint.
- Server Components por padrao. `"use client"` exige comentario justificando.
- Toda section exporta componente, `schema` (Zod), `meta` (priority, cwv, a11y)
  e story. Sem os quatro, o registry rejeita no build.
- Nenhum valor de marca hardcoded. Cor, fonte, raio e espaco so via token.
- Nenhum conceito de nicho hardcoded. Eixos de variacao, facetas, atributos e
  microcopy vem de `catalog` e `vocabulary`. Comportamento nunca depende de
  `catalog.vertical`: se algo muda por nicho, vira campo explicito.
- Formatacao BR centralizada em `/lib/format`: R$ com virgula, parcelamento
  "Nx de R$ Y sem juros", CEP, CNPJ, data dd/mm/aaaa.
- Commits em Conventional Commits. Um commit por entregavel coerente.

### Seguranca

Cadeia de suprimentos, segredos e headers tem gate no CI desde a Fase 0,
mesmo em repo vazio. Detalhe completo em
`docs/adr/0008-seguranca-de-cadeia-de-suprimentos-e-ci.md`.

- Nenhum segredo ou chave de API no cliente. `NEXT_PUBLIC_*` so para valor
  genuinamente publico; qualquer coisa sensivel fica em variavel de ambiente
  server-only.
- Gateways de pagamento (Asaas, Mercado Pago, Pagar.Me) sao responsabilidade
  do backend/painel. Este repo e frontend puro: nunca processa, nunca
  armazena e nunca loga credencial ou dado de pagamento.
- `pnpm audit --audit-level=high` roda no CI (job `validate`); vulnerabilidade
  high/critical bloqueia merge. Toda dependencia nova tambem passa por ele,
  alem do peso em KB ja exigido acima.
- `pnpm-lock.yaml` e obrigatorio e commitado; CI sempre instala com
  `--frozen-lockfile`. Dependabot mantem dependencias e GitHub Actions
  atualizados (`.github/dependabot.yml`).
- Scanner de segredos (gitleaks) e CodeQL correm no CI a cada push/PR
  (`.github/workflows/ci.yml` e `codeql.yml`).
- Headers de seguranca (CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, `frame-ancestors`) vem de
  `nears.config.yaml > security.headers`, nunca hardcoded em componente ou
  middleware/proxy.
- Resolucao de loja por dominio personalizado (multi-tenant) nunca confia
  direto no header `Host`: precisa validar contra a lista de dominios
  verificados pelo painel antes de rotear (host header injection, cache
  poisoning). Mecanismo exato e decisao de arquitetura da Fase 6; o contrato
  ja existe em `security.multiTenancy`.

## Comandos

```bash
pnpm dev                 # dev server
pnpm build               # build
pnpm test                # unit
pnpm test:e2e            # Playwright
pnpm test:a11y           # axe em todas as stories
pnpm test:nojs           # conteudo indexavel sem JavaScript
pnpm lh                  # Lighthouse CI contra o build
pnpm storybook
pnpm manifests:validate  # Zod sobre os 4 YAML de /nears
pnpm tokens:contrast     # falha se algum par semantico nao atingir AA
pnpm audit --audit-level=high  # vulnerabilidade de dependencia; gate no CI
pnpm validate            # tudo acima + check-budgets
```

## Definition of Done (por entregavel)

So considere pronto quando tudo abaixo passar:

1. `pnpm validate` verde
2. Testes unitarios cobrindo os estados do componente
3. Story no Storybook com todas as variantes e estados
4. 0 violacoes axe
5. Budgets respeitados (rode `pnpm lh` se tocou em rota)
6. Se mexeu em rota: Rich Results sem erro para os schemas daquele template
7. README ou ADR atualizado se houve decisao de arquitetura

## Como quero que voce trabalhe

- Trabalhe por fases, na ordem do `docs/ROADMAP.md`. Nao pule fase.
- Antes de comecar cada fase, liste o plano em uma frase por arquivo que vai criar.
- Ao fim de cada fase, rode `pnpm validate` e mostre o resultado dos budgets.
- Se uma decisao tiver mais de uma saida razoavel, escolha a mais conservadora em
  performance, registre um ADR em `docs/adr/` e siga. Nao trave esperando.
- Nunca instale dependencia nova sem dizer o peso em KB e o porque.
- Se eu pedir algo que fure um budget ou uma regra de a11y, avise e proponha
  alternativa antes de implementar.
