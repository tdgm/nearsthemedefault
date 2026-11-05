# ADR 0016 - Politica de agentes de IA, multi-tenancy e fonte da marca

- Status: aceito
- Data: 2026-11-05

## Contexto

Tres pontos estavam marcados como decisao de negocio (docs/PROMPTS.md) e a
manutencao delegou a escolha ao time tecnico ("faca a melhor escolha para o
projeto"). Este ADR registra o que foi escolhido, o porque e como reverter.
Inclui a fonte da marca, que dependia de aprovacao para baixar o arquivo.

## Decisao

### 1. Crawlers de IA (`contracts.yaml > geo.agents`)

| Agente | Politica | Motivo |
| --- | --- | --- |
| GPTBot | allow | alimenta ChatGPT; o objetivo do projeto e ser citado |
| OAI-SearchBot | allow | busca do ChatGPT, gera citacao e referral |
| PerplexityBot | allow | cita com link; referral direto |
| ClaudeBot | allow | coerente com a politica de citacao em assistentes |
| Google-Extended | allow | controla uso em Gemini/AI Overviews; bloquear nao protege o ranking e reduz citacao |
| CCBot | disallow | corpus de treino aberto, sem citacao nem referral |

Regra: permitir quem cita a loja; bloquear quem so coleta sem retorno. `robots.txt`
e `llms.txt` continuam gerados do manifest, entao uma loja muda a politica no proprio
`nears.config.yaml` sem tocar em codigo. A decisao vale como padrao do template, nao
como imposicao a cada marca.

### 2. `onMissingGeoField`

Permaneceu `warn-build` ate o fim da Fase 7 e foi promovido a `fail-build` no PR final
dela (docs/adr/0021): promover antes quebraria o build de templates que ainda nao
emitiam todos os campos GEO.

### 3. `security.multiTenancy.allowlistSource = panel-endpoint`

O frontend consulta, apenas no servidor, o endpoint do painel que lista dominios
verificados e resolve a loja a partir dele.

- Nunca confia no header `Host` cru: normaliza (minusculas, sem porta, sem ponto
  final) e exige correspondencia exata com um dominio verificado.
- Dominio desconhecido, erro de rede ou resposta invalida resultam em 404
  (fail-closed), nunca em loja padrao.
- Cache de TTL curto para acertos e cache negativo mais curto para desconhecidos,
  para evitar amplificacao contra o painel e cache poisoning.
- Endpoint e credencial ficam em variaveis de ambiente server-only (nenhum
  `NEXT_PUBLIC_*`).
- Descartadas: arquivo gerado no build (loja nova exigiria novo deploy) e
  resolucao somente upstream (o frontend ficaria sem defesa propria se o proxy
  falhar). Um cabecalho de proxy confiavel pode ser adicionado depois como
  otimizacao, sem substituir a validacao.

A implementacao e da Fase 6/8; este ADR fixa o contrato e o schema passa a aceitar
somente `panel-endpoint | build-file | upstream`.

### 4. Fonte da marca

`typography.font.brand.source` passou a `self-hosted` com Inter 4.1 (OFL-1.1),
conforme ADR 0001 (o padrao voltou a `system` no ADR 0020; o arquivo segue no repo). Arquivo: `packages/tokens/fonts/brand-variable.woff2`, 75,8 KB,
eixo `wght` 400-700, `opsz` fixado em 14, subset latin + latin-ext, features
`kern liga calt ccmp locl mark mkmk tnum lnum case`. A licenca esta em
`packages/tokens/fonts/OFL.txt`. Origem: release oficial
`rsms/inter` v4.1, `InterVariable.ttf` com sha256
`4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`; processada com
fonttools (`varLib.instancer` + `pyftsubset --flavor=woff2`). Trocar de marca
continua sendo trocar `tokens.json` e o woff2; `source: "system"` volta a zero
download.

## Consequencias

- Custo de rede: um arquivo de 75,8 KB (nao conta no JS; preload so do peso 400
  conforme ADR 0001). Os budgets de JS/CSS/HTML devem permanecer iguais.
- A politica de agentes e reversivel por loja, sem codigo.
- A resolucao por dominio depende da disponibilidade do painel; o cache e o
  fail-closed definem o comportamento sob falha.
