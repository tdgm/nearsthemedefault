# ADR 0012 - Manifests: schemas Zod, loader tipado e checks cruzados

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 0 entregou um stub (`scripts/manifests-validate.mjs`) que so fazia parse
de YAML e alguns invariantes de `routes.manifest.yaml`. A Fase 1 (docs/ROADMAP.md)
pede: schemas Zod completos para os 4 YAML de `/nears`, um loader tipado, geracao
de tipos a partir dos manifests, um section registry que falha o build se uma
section nao declarar `priority`, `cwv` e `a11y`, e resolucao das referencias
`from:`/`enabledBy:` para os blocos `catalog` e `vocabulary` - gerando os tipos
certos para o nicho configurado (docs/adr/0002).

## Decisao

1. **Pacote novo `packages/manifests` (`@nears/manifests`)**, nao um script
   solto nem codigo dentro de `apps/web`. Os 4 manifests sao infraestrutura
   compartilhada (futuramente `packages/ui` e `packages/sections` tambem vao
   ler o section registry para gerar prop-types, Fase 3+); um pacote de
   workspace deixa isso explicito e reusavel, no mesmo padrao de `@nears/tokens`
   e `@nears/ui` (TypeScript fonte, sem passo de build - `main`/`types` apontam
   pra `src/index.ts`).
2. **Zod e' a unica fonte dos tipos** (`z.infer<typeof schema>`), nao um gerador
   de tipos separado. Dois artefatos (schema de validacao + arquivo de tipos)
   divergem com o tempo; um so' nao.
3. **`zod@^4`** como `dependency` do pacote (roda em build/SSR, nunca no
   cliente: 0 KB no bundle do navegador, nao conta pro orcamento de JS de
   CLAUDE.md > Performance). Peso instalado ~1,8 MB, passa em
   `pnpm audit --audit-level=high`.
4. **`tsx@^4`** como `devDependency` da raiz, so' para `pnpm manifests:validate`
   rodar o script TypeScript sem passo de build (`scripts/manifests-validate.ts`).
   0 KB no cliente; alternativa seria compilar antes ou usar
   `node --experimental-strip-types`, que e' mais fragil entre versoes de Node
   do que um executor dedicado.
5. **`props` dentro de `sections.registry.yaml` fica com tipo aberto**
   (`z.record(string, unknown)`) por enquanto. A mini-DSL de props
   (`type`/`of`/`values`/`from`/`enabledBy`...) ainda nao tem consumidor em
   runtime - isso chega quando os componentes de `packages/ui`/`packages/sections`
   lerem o registry pra gerar as proprias prop-types (Fase 3+). O que a Fase 2
   exige de verdade - `priority`, `cwv` e `a11y` obrigatorios em toda section -
   esta' no schema como campos obrigatorios, nao opcionais: o build falha se
   faltar qualquer um dos tres.
6. **Checks que cruzam manifests vivem fora dos schemas Zod**, em
   `packages/manifests/src/cross-checks.ts`: Zod valida a FORMA de cada arquivo
   isoladamente; ids duplicados, referencias `enabledBy:`/`from:` que apontam
   pra dentro de `nears.config.yaml`, e a regra `priority: inherit` +
   `nestedOnlyIn` do section registry dependem do CONTEUDO combinado dos 4
   arquivos. `params.*.from` de `routes.manifest.yaml` (ex.:
   `navigation.departments`) e' deliberadamente EXCLUIDO desse check: aponta
   pra uma fonte de dados em runtime (CMS/catalogo), nao pra um caminho dentro
   do manifest de config.
7. **Cobertura de preset via teste, nao via CLI**: `pnpm manifests:validate`
   roda contra os 4 arquivos reais (preset `generic`, como commitado).
   `packages/manifests/src/presets.test.ts` aplica os presets `fashion`,
   `electronics` e `grocery` do ADR 0002 (override parcial de `catalog`/`vocabulary`
   sobre uma copia temporaria dos manifests reais) e roda o mesmo loader +
   cross-checks - cobre a exigencia do gate ("generic e pelo menos dois
   presets") dentro de `pnpm test`, que ja faz parte de `pnpm validate`.
8. **`apps/web/lib/manifest.ts` passa a delegar pro pacote**, mantendo
   `loadConfig`/`loadRoutes`/`vocab` com a mesma assinatura - os 3 call-sites
   existentes (`layout.tsx`, `page.tsx`, `s/page.tsx`) nao mudam.

## Consequencias

- `scripts/manifests-validate.mjs` (Fase 0) e substituido por
  `scripts/manifests-validate.ts`, que importa `@nears/manifests` em vez de
  reimplementar parse e invariantes.
- Erro de schema aponta o caminho exato dentro do YAML (`ManifestValidationError`),
  nao so "YAML invalido".
- Qualquer preset novo do ADR 0002 ganha o mesmo nivel de validacao sem
  escrever codigo: basta um teste novo em `presets.test.ts` com o bloco
  `catalog`/`vocabulary` copiado do ADR.
- Decisao pendente para quando `packages/ui`/`packages/sections` existirem
  (Fase 3+): tipar `props` de verdade a partir da mini-DSL, ou manter
  `z.record` e validar prop-a-prop no proprio componente. Registrar em ADR
  novo quando chegar la', nao aqui.
