# ADR 0006 - Resolução de `priority: inherit` e limite de seções da home

- Status: aceito
- Data: 2026-11-03

## Contexto

`sections.registry.yaml` usava `priority: inherit` em duas sections
(`section-title`, `product-card`) sem esse valor existir em `priorityLevels`
- o build teria recusado as duas por "priority inválida" assim que o schema
Zod da Fase 2 fosse escrito.

Separadamente, a home do template padrão (`templates.home.sections`) tem 13
instâncias fixas mais um bloco repetido 3× por departamento
(`section-title`, `banner-grid`, `category-hub`). Com `maxSectionsPerPage: 24`
contando instâncias renderizadas, qualquer loja com 4 ou mais departamentos
já estourava o limite - e o template também reaproveitava `hero` (crítico,
`fetchpriority: high`, candidato a LCP) uma segunda vez no meio da página,
onde claramente não é o elemento acima da dobra.

## Decisão

**`inherit` passa a ter definição formal.** Não é um nível próprio: resolve
em build time para a `priority` da section que instancia o bloco. Só pode
ser usado por uma section que declare `nestedOnlyIn` com os ids dos
containers onde aparece - o build falha se usada fora desse contexto (sem
mãe de quem herdar). `product-card` mantém `inherit`
(`nestedOnlyIn: [product-grid, showcase, pdp-bundle, pdp-related]`):
dentro de `product-grid` (crítico) o card entra no HTML inicial; dentro de
`showcase`/`pdp-bundle`/`pdp-related` (lazy) ele é diferido. `section-title`
não precisa herdar - é só título e link, sem mídia, custo fixo desprezível
em qualquer posição - então ganhou prioridade própria (`high`), o que também
permite usá-la direto dentro de um `repeat`.

**O segundo `hero` saiu da home.** Era redundante com os dois `event-banner`
e o `banner-full` que já cobrem banners promocionais abaixo da dobra, e
usar uma section com `fetchpriority: high`/`loading: eager` fora da posição
de LCP é o tipo de coisa que o próprio CLAUDE.md pede para evitar (`fetchpriority`
alto é para o candidato a LCP, não para qualquer banner).

**O número de departamentos exibidos inline na home agora tem limite,
configurável por loja:** `nears.config.yaml > composition.home.featuredDepartments`
(default 6). Além desse número, o departamento continua indexável - só não
ganha bloco dedicado na home - via `nav-drawer` (links já estão no HTML
inicial) e via `/mapa-do-site` (rota `sitemap-html`, obrigatória e sem
limite). Isso é puramente uma escolha editorial/de performance da home, não
uma perda de SEO.

**`validation` passa a distinguir dois contadores**, em vez de um só que
confundia dois problemas diferentes:

- `maxSectionsPerPage` (24): tipos DISTINTOS de section usados num template -
  a superfície de composição, o número de chunks JS possíveis. Um `repeat`
  conta uma vez por tipo, não por instância.
- `maxSectionInstancesPerPage` (40, novo): instâncias renderizadas após
  expandir todo `repeat` - o peso real de HTML/DOM da página. Mais generoso
  porque instâncias lazy reusam o mesmo chunk JS do tipo e não competem por
  orçamento de JS inicial.
- `maxCriticalSections` (4, já existia): instâncias com `priority: critical`.

## Verificação

Simulação expandindo o template `home` com 1, 6, 7, 12 e 50 departamentos:
11 tipos distintos (≤24) e no máximo 30 instâncias (≤40) em todos os
cenários, 1 section crítica (≤4) em todos - o segundo `hero` era o único
motivo de ter mais de uma. O template `sitemap`, que precisa listar TODOS os
departamentos sem limite, continua sem cap (51 instâncias com 50
departamentos, por design).

## Consequências

- Nenhuma loja com qualquer número de departamentos quebra o build pela
  home.
- Componentes aninhados (Fase 3) que usam `priority: inherit` precisam
  receber a priority resolvida como prop/contexto do container, não lê-la
  de um valor fixo próprio.
- Uma loja pode ajustar `featuredDepartments` sem tocar no registry.
