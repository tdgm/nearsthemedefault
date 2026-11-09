# 0030 - "Core Web Vitals" (Lighthouse CI) e ruidoso no runner compartilhado do GH Actions

## Status

Aceita.

## Contexto

O job `Core Web Vitals` (`.github/workflows/ci.yml`, `pnpm lh` -> `lhci autorun`)
falhava de forma intermitente na PR da Fase 10 (#26), especificamente por
`largest-contentful-paint` acima do orcamento de 2000ms em `/`
(valores medidos: 2563.76ms, 2271.96ms, 2269.99ms nas 3 execucoes daquela
run). Antes de assumir que era uma regressao de codigo introduzida pela
Fase 10, foram checadas duas coisas:

1. **Re-executar o MESMO job, no MESMO commit, sem mudar nada**: voltou
   verde (`success`) na segunda tentativa.
2. **Historico do check nos ultimos 15 commits de `main`**:

   | commit | conclusion | o que mudou |
   | --- | --- | --- |
   | `cb0871a` (Fase 10, apos retry) | success | - |
   | `e1b911d` (Fase 9d) | failure | fulfillment por loja |
   | `f9b21e1` (Fase 9c) | success | area da conta |
   | `c28b998` | **failure** | **so docs** (corrige um texto na ADR 0028/ROADMAP) |
   | `e8127ae` (Fase 9b) | failure | login/cadastro mock |
   | `7cd39e7` (Fase 9a cont.) | success | contrato de estoque por loja |
   | `32f43bd` (Fase 9a) | failure | fundacao de conta |
   | `422741f` | success | fix de scroll/overflow |

   `c28b998` e um commit **so de markdown** (nenhum arquivo de codigo, config
   ou manifest mudou) e mesmo assim falhou o mesmo check. Um commit sem
   nenhuma mudanca de codigo nao pode causar uma regressao de performance -
   a unica explicacao e variancia do proprio runner (`ubuntu-latest`,
   compartilhado, sem isolamento de CPU) entre execucoes do job.

Uma tentativa de reproduzir localmente no Mac de validacao (Chrome local,
sem precisar do Chromium do Playwright) saiu MUITO mais extrema -
`total-blocking-time` de 7-9 SEGUNDOS, `performance` score 0.51-0.68 - o
que so confirma o problema: aquela maquina tinha dezenas de processos do
Chrome e do Electron (Claude desktop) competindo por CPU ao mesmo tempo
que o Lighthouse headless rodava, invalidando a medicao como sinal de
diagnostico. Isso nao mudou a conclusao (CPU contesa = metricas erradas em
qualquer ambiente, CI ou local), so reforcou que o numero certo so vem de
um ambiente sem contencao - que o runner do GH Actions tambem nao garante
ser, no momento exato de cada run.

## Decisao

Tratar isso como **ruido de medicao**, nao como uma regressao de
performance a caçar no codigo da aplicacao - nenhuma mudanca de codigo
(componente, layout, bundle) foi feita por esta ADR. Duas mudancas,
nenhuma delas afrouxa orcamento algum (todos os `maxNumericValue`/
`minScore` em `lighthouserc.json` continuam exatamente iguais):

1. **`lighthouserc.json`**: `collect.numberOfRuns` sobe de 3 para 5. Mais
   amostras por URL reduz a chance de a agregacao do LHCI cair sobre um
   outlier causado por um pico de CPU do runner.
2. **`.github/workflows/ci.yml`**: o passo `pnpm lh` ganha um retry de 1x
   (ate 2 tentativas) num loop de shell simples - sem acao de terceiro
   nova (nada de `nick-fields/retry` ou similar: e so um `for` no proprio
   `run:`, zero custo de KB porque roda so no CI, nunca no bundle do
   site). Mesma logica que o protocolo de triagem de CI deste projeto ja
   usa manualmente ("re-executar o job falho uma vez pra descartar flake
   antes de investigar mais"): agora e automatico, entao uma PR legitima
   nao fica bloqueada por um pico de CPU do runner que passaria limpo na
   proxima tentativa.

Escolha conservadora em performance (CLAUDE.md): os limites continuam os
mesmos; a unica coisa que muda e quantas amostras e quantas tentativas o
CI usa pra decidir se um numero real passou ou nao. Se um dia a amostra
MEDIANA de 5 execucoes, repetida por 2 tentativas, ainda estourar o
orcamento de forma consistente, isso volta a ser sinal real de
regressao - a diferenca e que hoje um unico pico isolado de CPU do runner
derruba a PR inteira, o que este fix elimina sem mascarar uma regressao
de verdade (3+ outliers nas 5 execucoes, nas 2 tentativas, e um padrao
estatisticamente dificil de atribuir so a ruido).

## Consequencias

- `pnpm lh` local (fora do CI) nao tem o retry automatico - quem rodar na
  propria maquina ainda ve a falha de primeira se o ambiente estiver sob
  carga (como aconteceu na tentativa de reproducao nesta ADR); isso e
  aceitavel, o retry e so uma proteção do CI contra ruido do runner
  compartilhado, nao uma garantia de que todo ambiente vai estar livre de
  contencao.
- O job pode agora demorar o dobro do tempo em CI no PIOR caso (2
  tentativas completas de `pnpm lh`, cada uma com 5 execucoes por URL em
  vez de 3) - aceito porque o job so roda em push/PR, nunca bloqueia o
  dev local, e o custo de uma PR falsa-negativa bloqueada e maior que
  alguns minutos extra de CI ocasionais.
- Nao foi encontrada nem alterada nenhuma causa de performance real no
  codigo da aplicacao - se uma regressao de verdade aparecer no futuro,
  ela precisa se manifestar de forma consistente (nao um pico isolado)
  pra sobreviver a 5 execucoes x 2 tentativas, o que e o comportamento
  desejado.
