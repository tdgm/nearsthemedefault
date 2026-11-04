# ADR 0008 - Seguranca de cadeia de suprimentos e CI

- Status: aceito
- Data: 2026-11-04

## Contexto

NEARS e uma plataforma SaaS multi-tenant; este repo e o template de
frontend compartilhado por todas as lojas (cada uma com dominio proprio,
ex.: `followin.com.br`, administrada via `painel.nears.com.br`). Antes da
Fase 0 adicionar o primeiro `package.json`/lockfile, valia revisar o plano
com lente de engenharia e seguranca: nada do que segue depende de ter app
implementado, e comecar sem esses gates significa carregar a divida pelas
oito fases inteiras em vez de nascer com ela resolvida.

Revisão cobriu: `.github/workflows/ci.yml`, `lighthouserc.json`,
`nears/contracts.yaml`, `.gitignore` e o plano de dependencias da Fase 0
apresentado antes deste ADR.

## Decisao

1. **`permissions` least-privilege no `ci.yml`**: `contents: read` no topo
   do workflow. Nenhum job precisa escrever no repo; `dependency-review` e
   o unico que eleva (`pull-requests: read`), e so no evento `pull_request`.
2. **`pnpm audit --audit-level=high`** no job `validate`, logo depois do
   install. Vulnerabilidade high/critical bloqueia merge, reforcando (nao
   substituindo) a regra do `CLAUDE.md` de justificar peso em KB de toda
   dependencia nova.
3. **Scanner de segredos** (`gitleaks/gitleaks-action@v2`) como job
   independente (`secrets-scan`), com `fetch-depth: 0` - varre o historico
   completo do clone, nao so o commit atual.
4. **CodeQL** (`javascript-typescript`) em workflow separado
   (`.github/workflows/codeql.yml`), rodando em `push`/`pull_request` e
   semanalmente (scan independente de atividade no repo).
5. **`actions/dependency-review-action`** no evento `pull_request`
   (`fail-on-severity: high`). Nota de honestidade: o repo e **privado**,
   e esse Action exige GitHub Advanced Security habilitado na organizacao.
   Sem GHAS o job falha por falta de permissao da plataforma, nao por
   vulnerabilidade real - confirmar o GHAS antes de tratar este job como
   gate obrigatorio e nao so informativo.
6. **Dependabot** (`.github/dependabot.yml`) para o ecosystem `npm` (raiz do
   workspace pnpm - Dependabot detecta `pnpm-lock.yaml` automaticamente e
   cobre `apps/*` e `packages/*`) e para `github-actions`.
7. **Actions pinadas por tag major** (`@v4`, `@v2`, `@v3`), nao por SHA de
   commit. Decisao deliberada: nao fabricar hash a mao - um SHA errado
   digitado e pior que nao pinar (quebra silenciosamente ou aponta pra
   commit errado, e nenhuma ferramenta deste sandbox tinha acesso de API ao
   GitHub pra resolver o hash real no momento desta revisao). O Dependabot
   do item 6 (`github-actions`) e quem mantem as tags atualizadas; se
   quisermos pin por digest mais adiante, e ele que resolve o hash
   verdadeiro, nunca uma copia manual.
8. **`.gitignore`** ganhou `.lighthouseci/`, `playwright-report/`,
   `test-results/`, `storybook-static/` e extensoes de chave/certificado
   (`*.pem`, `*.key`, `*.cert`, `*.p12`) - nenhum artefato de teste ou
   credencial deveria chegar a ser commitado.
9. **`nears.config.yaml > security`** (novo bloco, mesmo padrao declarativo
   do resto do arquivo): headers (CSP em modo `strict-dynamic`, HSTS,
   `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
   `frame-ancestors: none`) como contrato - nenhum componente, middleware
   ou proxy pode hardcoded isso, igual ja vale para cor/fonte/microcopy.
10. **`nears.config.yaml > security.multiTenancy`** sinaliza explicitamente
    que a resolucao de loja por dominio personalizado nao pode confiar
    direto no header `Host` sem validar contra uma lista de dominios
    verificados (risco: host header injection, cache poisoning, SSRF por
    Host forjado). O mecanismo exato (`allowlistSource`) e decisao de
    arquitetura/negocio ainda em aberto - adicionada a
    `docs/PROMPTS.md > Decisoes de negocio que nao sao suas`, ao lado de
    `geo.agents` e `onMissingGeoField`, que ja seguiam esse padrao.
11. **`contracts.yaml > gates.security`**, espelhando o bloco acima no
    mesmo estilo de `enforced-in-ci` / `pending-fase-6` ja usado nos outros
    gates do arquivo.

## Consequencias

- O CI continua "falhando so por falta de `package.json`/lockfile/app"
  (mesma frase ja usada em `docs/PROMPTS.md`), agora cobrindo tambem
  auditoria de dependencias, scanner de segredos e SAST desde o repo
  vazio - nada disso e retrofit depois de oito fases de app implementado.
- Toda vez que uma dependencia nova entrar, em qualquer fase, ela passa por
  peso em KB (regra existente do `CLAUDE.md`) **e** por `pnpm audit` (novo)
  antes de mergear.
- A configuracao real do header (CSP com nonce por requisicao, etc.) so
  acontece quando houver app Next para configurar - o que existe agora e o
  contrato no manifest, nao o middleware/proxy. Isso e intencional: a Fase
  0 nao cria codigo de app, so os manifests/CI que o guiam.
- `dependency-review-action` e um gate de "melhor esforco": se a
  organizacao nao tiver GHAS, o job falha e precisa ser ajustado (desabilitar
  ou contratar GHAS) antes de travar merge por ele de verdade. Isso fica
  marcado no proprio `ci.yml`, nao escondido.
- A resolucao de dominio por tenant (quem mantem a allowlist, onde ela mora)
  continua sem decisao tecnica tomada por conta propria - fica paralela a
  `geo.agents`/`onMissingGeoField` como pergunta de negocio a responder
  antes do go-live multi-tenant (Fase 6 em diante).

## Verificacao

Nenhum SHA foi inventado neste ADR: toda referencia de Action usa tag
semver oficial (`gh api` para resolver hash real nao tinha acesso de rede
liberado para os repos de Actions neste sandbox), e a atualizacao continua
automatica via Dependabot (item 7). Os blocos novos de YAML
(`nears.config.yaml > security`, `contracts.yaml > gates.security`) foram
validados com `python3 -c "import yaml; yaml.safe_load(...)"` nos dois
arquivos alterados - o parser Zod real só existe a partir da Fase 2.
