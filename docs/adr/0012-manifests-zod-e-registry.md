# ADR 0012 - Manifests com Zod, tipos gerados e registry de sections

- Status: aceito
- Data: 2026-11-04

## Contexto

A Fase 2 (docs/ROADMAP.md) pede schemas Zod para os 4 YAML de `/nears`, loader
tipado, resolucao de `from:` e `enabledBy:`, tipos gerados do nicho configurado e
um registry que falha o build se uma section nao declarar `priority`, `cwv` e
`a11y`. Ate aqui `scripts/manifests-validate.mjs` so fazia parse e quatro
invariantes de rotas.

## Decisao

1. **Pacote `@nears/manifests`** (`packages/manifests`, TypeScript sem etapa de
   build, como `@nears/sections`). Duas entradas: `@nears/manifests` (puro:
   schemas, referencias, props, geracao) e `@nears/manifests/node` (le disco;
   so servidor e scripts).
2. **Zod 4** (`zod@^4.6`), exigido pelo CLAUDE.md. ~5 MB instalado e **0 KB no
   bundle do navegador**: so e importado por codigo de servidor e scripts
   (conferido em `pnpm check-budgets`). `yaml` ja era dependencia do repo.
3. **Sem `tsx`**: os scripts importam o TypeScript direto (type stripping do
   Node). `engines.node` sobe de `>=22.13` para `>=22.18` (type stripping
   estavel) e os scripts rodam com `--disable-warning=ExperimentalWarning`.
   Consequencia: nos pacotes `.ts` com `allowImportingTsExtensions` e
   `erasableSyntaxOnly` (sem `enum`, sem parameter properties).
4. **Schemas estritos** (`z.strictObject`) em `catalog`, rotas e sections: campo
   desconhecido e erro, para pegar typo no YAML. Blocos de infraestrutura que o
   codigo ainda nao le (`rendering`, `design`, `security`) usam
   `z.looseObject` com os campos criticos tipados.
5. **Referencias** (`refs.ts`). `from:`, `enabledBy:`, `indexableFrom`,
   `requiredForGeoFrom`, `variesBy`, `default: vocabulary.x` e placeholders
   `{media.aspect[catalog.productMedia.aspect]}` resolvem contra `catalog`,
   `vocabulary`, `composition` e `tokens.json > media`. Raiz `navigation` e do CMS
   e nao e checada. Caminho inexistente falha o build.
6. **Invariantes entre manifests**: ids unicos; template de cada rota existe;
   `canonicalTo`, `slugIndex` e `secondSegment` apontam para rotas reais; segmento
   literal de rota esta em `reserved`; `neverIndexable` nao intersecta
   `catalog.facets.indexable`; `priority: inherit` so com `nestedOnlyIn` valido e
   nunca direto em template; variantes existem; limites de
   `validation.maxSections*` e `maxCriticalSections` valem por template, com
   `repeat` expandido.
7. **DSL de props -> Zod** (`props.ts`). `from:` fecha a lista pelo nicho (nicho
   sem eixos de variacao so aceita `[]`); `enabledBy:` desligado proibe o campo;
   `default: vocabulary.x` vira o texto da loja. Convencoes: `image` exige
   `src`, `width`, `height` (CLAUDE.md); `money` e numero em reais (formatacao em
   `/lib/format`); `table` e `{headers, rows}` para virar `<table>` semantico.
   Campo so e obrigatorio com `required: true`.
8. **Tipos gerados** em `packages/manifests/_generated/nears.types.ts`
   (versionado): `VariantAxisId`, `FacetId`, `IndexableFacetId`,
   `GeoAttributeId`, `VocabularyKey`, `SectionId`, `RouteId`, `TemplateId` e
   `catalogFlags`. `pnpm manifests:types` grava; `pnpm manifests:check` (parte do
   `pnpm validate`) falha se divergir. `vocab()` do app passa a aceitar so
   `VocabularyKey`.
9. **Presets como arquivos**: `nears/presets/*.yaml` (fashion, electronics, home,
   beauty, grocery, pet) substituem `catalog` e mesclam `vocabulary`. O gate
   `pnpm manifests:validate` valida e gera tipos para o `generic` **e** para todos
   os presets. Os blocos do ADR 0002 passam a ser ilustrativos; a fonte da verdade
   sao os arquivos.
10. **Registry** (`packages/sections`). `defineSection` fixa o contrato (Component,
    `schema`, `meta`, `story`); `createRegistry` rejeita section fora do manifest,
    sem componente, sem `schema`, sem `meta.cwv`/`meta.a11y`, com `meta.priority`
    divergente do manifest ou com story inexistente em disco. Roda dentro do
    `manifests:validate`. Nenhuma section esta implementada ainda (22 pendentes,
    Fases 4 e 5), entao o registry parte vazio.

## Consequencias

- Trocar de nicho continua sendo trocar `catalog`/`vocabulary` (ou copiar um
  preset); o TypeScript passa a acusar eixo, faceta ou chave de vocabulario
  inexistente em tempo de compilacao.
- Editar um YAML sem regenerar os tipos quebra o CI.
- Os tipos gerados refletem **um** nicho (o de `nears.config.yaml`). Em outro
  nicho, rode `pnpm manifests:types` e commite.
- `validation.everySectionMustDeclare` e um contrato fixo `[priority, cwv, a11y]`
  no schema; remover um deles do YAML falha em vez de afrouxar o gate.
- Fora do escopo: schema Zod do `tokens.json` (segue com `core.mjs`, ADR 0011).
- Atualizacao (commit `7192d82`): `contracts.yaml` ganhou schema Zod completo e
  estrito (`data`, `seo`, `geo`, `gates`), em vez do `looseObject` adiado para a
  Fase 7. O CLAUDE.md exige Zod em todo manifest, sem excecao; a Fase 7 apenas
  consome os tipos para gerar os helpers de JSON-LD.
