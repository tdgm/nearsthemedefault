linha1
linha2
  indentado
# CLAUDE.md - nearsthemedefault

## O que e este projeto

Template padrao white-label da plataforma **Nears**: o front-end base de todas as
lojas criadas na plataforma. Nao e um site unico. Tudo precisa ser parametrizavel
por tokens e por manifests declarativos, sem valores de marca hardcoded.

Benchmark estrutural: hering.com.br (VTEX FastStore + Next.js). Replicamos o
**padrao arquitetural** - composicao por sections versionadas no CMS, eixos
multiplos de navegacao, landings de cauda longa, par TextSEO + RelatedLinks ao
fim de todo template. **Nunca** copiamos identidade visual, textos, imagens ou
codigo de terceiros.

## Stack obrigatoria

- Next.js 15 (App Router) + React 19 + TypeScript strict
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
| JS inicial da rota critica | 120 KB gzip |
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
- Fonte: uma familia variavel self-hosted, woff2 subsetado, `font-display: swap`,
  preload so do peso 400, `size-adjust` calibrado contra o fallback.
- Secoes abaixo da dobra recebem `content-visibility: auto` com
  `contain-intrinsic-size` declarado.
- Script de terceiro nunca bloqueia render. Carrega via `afterInteractive`,
  `lazyOnload` ou Partytown. Cada um precisa de ADR justificando o custo.

### Acessibilidade

WCAG 2.2 AA e gate de merge, nao aspiracao.

- Alvo de toque >= 44x44px; foco visivel sempre; contraste testado automaticamente
- Seletor de tamanho e `radiogroup`, nao lista de botoes
- Adicionar a sacola anuncia resultado em `aria-live="polite"`
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
- Tabelas de medidas e composicao em HTML semantico. Nunca em imagem.
- Primeiro paragrafo de todo bloco de texto responde diretamente a pergunta do
  heading (otimizacao para motores generativos).
- `robots.txt` e `llms.txt` gerados a partir do manifest.

### Codigo

- TypeScript strict. `any` e erro de lint.
- Server Components por padrao. `"use client"` exige comentario justificando.
- Toda section exporta componente, `schema` (Zod), `meta` (priority, cwv, a11y)
  e story. Sem os quatro, o registry rejeita no build.
- Nenhum valor de marca hardcoded. Cor, fonte, raio e espaco so via token.
- Formatacao BR centralizada em `/lib/format`: R$ com virgula, parcelamento
  "Nx de R$ Y sem juros", CEP, CNPJ, data dd/mm/aaaa.
- Commits em Conventional Commits. Um commit por entregavel coerente.

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
