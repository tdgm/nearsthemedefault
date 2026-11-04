# Prompts para o Claude Code

## Kickoff

Cole na primeira sessao, dentro do repositorio.

```
Leia CLAUDE.md e docs/ROADMAP.md antes de qualquer coisa.

Voce vai construir o template padrao da plataforma Nears do zero, seguindo o
roadmap fase por fase. Comece pela Fase 0.

Antes de escrever codigo, me devolva:
1. A arvore de arquivos que voce vai criar nesta fase, uma linha por arquivo
   com uma frase explicando o papel dele.
2. A lista de dependencias que vai instalar, com o peso gzip de cada uma e a
   justificativa. Se alguma passar de 15 KB, proponha alternativa.
3. Como o script pnpm validate vai medir e falhar nos budgets.

Depois que eu aprovar, implemente a fase inteira, rode pnpm validate e me
mostre a saida. Nao avance para a Fase 1 sem meu ok.

Regras que nao quero repetir: TypeScript strict, Server Components por padrao,
nenhum valor de marca hardcoded, toda imagem com dimensao declarada, zero libs
de UI prontas, e todo componente nasce com story + teste + axe limpo.
```

## Fase 1 - Tokens

```
Implemente a Fase 1. O arquivo packages/tokens/tokens.json ja existe no repo
com valores concretos - use-o como base, nao recomece do zero.

Entregue o build Style Dictionary gerando CSS vars, preset Tailwind e JSON para
Figma, e um teste automatizado que falha se qualquer par semantico (texto sobre
superficie, borda sobre superficie, estado de foco) nao atingir AA. Mostre a
tabela de contrastes calculados ao final.

Calibre tambem o bloco typography.fallbackMetrics contra a fonte real quando
ela existir; por ora os valores sao os da Inter.
```

## Fase 2 - Manifests e registry

```
Implemente a Fase 2. Os quatro YAML em /nears ja existem no repo. Escreva o
schema Zod correspondente a cada um, o loader que valida em build time e a
geracao de tipos TypeScript a partir deles.

O section registry deve recusar o build se uma section nao declarar priority,
cwv e a11y. Demonstre criando uma section invalida de proposito, mostrando o
erro, e depois removendo.
```

## Fase 3 - Design system

```
Implemente a Fase 3 na ordem: primitivos de formulario, depois feedback, depois
overlay, depois compostos. O Carousel usa scroll-snap nativo com navegacao por
teclado e botoes reais - nao quero nenhuma lib. O componente Image deve ser
impossivel de usar sem passar aspect-ratio ou width+height: force isso pelos
tipos. Reporte o bundle size do pacote ao final.
```

## Fase 4 - Sections globais

```
Implemente a Fase 4. Pontos de atencao: a PromoBar com countdown precisa
reservar altura e renderizar o tempo no servidor para nao causar CLS nem
hydration mismatch. O NavDrawer carrega os dados do menu no HTML mas o
JavaScript do drawer so entra na interacao. O Header muda de variante por
padrao de rota lido do routes.manifest. Meca o JS inicial antes e depois.
```

## Fase 5 - Sections de conteudo

```
Implemente a Fase 5. O Hero e o candidato a LCP: primeiro slide eager com
fetchpriority high, art direction real por <picture>, demais slides lazy.
O ProductGrid renderiza no servidor com skeleton de altura exata. O ProductCard
nao pode ser um link unico envolvendo tudo - acoes de wishlist e quick add sao
controles separados e acessiveis. Rode pnpm lh e me mostre o LCP.
```

## Fase 6 - Templates e rotas

```
Implemente a Fase 6. A regra de canonical e critica: quando um produto aparece
tanto em /{departamento}/{categoria} quanto em /{tipo-de-peca}/{modelagem}, o
canonical aponta para o eixo de departamento, e o eixo plano so e indexavel no
nivel 1. Implemente tambem a rota de landing de cauda longa /b/{slug} com
filtros pre-aplicados, exigindo H1, introducao e FAQ unicos por pagina.
Valide com JS desabilitado e me mostre o HTML renderizado de uma collection.
```

## Fase 7 - SEO e GEO

```
Implemente a Fase 7. Os helpers de JSON-LD sao tipados e derivados do
contracts.yaml - se um campo obrigatorio para GEO faltar, o build avisa.
Product sem aggregateRating, shippingDetails ou hasMerchantReturnPolicy e
considerado incompleto. Ao fim desta fase, mude onMissingGeoField de
warn-build para fail-build.

Gere llms.txt com politica explicita por agente, deixando os valores como
configuracao e nao como decisao sua. Ao final, cole o JSON-LD gerado de uma PDP
para eu validar no Rich Results.
```

## Fase 8 - Endurecimento

```
Implemente a Fase 8. Mova todos os scripts de terceiros para Partytown ou
carregamento pos-interacao e prove com medicao antes/depois. Instrumente RUM de
Core Web Vitals. Escreva os E2E do fluxo completo de compra ate a sacola.
Finalize com um guia de onboarding em /docs explicando como alguem cria uma
nova loja na Nears trocando apenas tokens e manifests.
```

## Como conduzir

Rode uma fase por sessao. No inicio de cada sessao o Claude Code rele o
CLAUDE.md, entao as regras nao se perdem entre contextos. Quando o contexto
encher no meio de uma fase, peca um resumo do estado atual e abra sessao nova:
o roadmap e os manifests ja no disco fazem o trabalho de reancoragem.

Dois pontos valem revisao manual em vez de confiar no gate automatico: a
calibragem do size-adjust da fonte na Fase 1, que o teste nao pega bem, e a
decisao de quais agentes de IA permitir no llms.txt na Fase 7, que e escolha de
negocio e nao tecnica.
