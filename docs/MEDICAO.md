# Plano de medição

O que acompanhar depois que a loja está no ar, de onde vem cada número e o que o template
já instrumenta. O laboratório (Lighthouse CI) impede regressão; só o campo diz como o
cliente vive a loja. Metas e orçamentos: `nears/nears.config.yaml > budgets`.

## 1. O que o template já entrega e o que a loja liga

| Sinal | Entregue no template | A loja precisa |
| --- | --- | --- |
| Core Web Vitals de campo (RUM) | Coletor inline (ADR 0022): LCP, FCP, CLS, INP, TTFB por rota e por viewport | Apontar `observability.rum.endpoint` para um coletor https e ajustar `sampleRate` |
| Core Web Vitals do Google (CrUX) | Nada a instalar | Domínio com tráfego suficiente; conferir no Search Console e na API do CrUX |
| Indexação e rich results | Sitemap segmentado, canonical/robots por faceta, JSON-LD por template | Verificar o domínio no Search Console e enviar `/sitemap.xml` |
| Tráfego vindo de IA | Script que publica `{ event: "ai_referral", ai_source }` no `dataLayer` | Um tag manager em `thirdParties.scripts` (com ADR) para gravar o evento |
| Rastreio por agentes de IA | `robots.txt` e `llms.txt` gerados do manifest | Contar acessos por user-agent no log do servidor ou CDN |
| Citação em respostas de IA | Nada automático | Rodar a rotina da seção 4 |

O mock `/api/rum` valida o contrato e **descarta** o beacon: sem coletor configurado o RUM
não é uma métrica real.

## 2. Core Web Vitals

Metas (p75 mobile): LCP < 2,0 s, INP < 200 ms, CLS < 0,05, TTFB < 400 ms, FCP < 1,5 s.

**Campo, três fontes que se confirmam:**

1. **RUM próprio.** Beacon `{ p, v, m }`: `p` pathname sem query, `v` `m` (viewport < 768 px) ou
   `d`, `m` as métricas. Agregue por rota-padrão (não por URL de produto), por `v`, e calcule
   p75 por dia. Alerte quando o p75 de uma rota passar da meta por 2 dias seguidos.
   Cuidados: CLS pela janela de sessão e INP como a pior interação (em sessões muito longas
   o INP superestima o p98, erro para o lado conservador). Não roda com DNT/GPC, então o
   volume é menor que o de pageviews.
2. **CrUX** (relatório Core Web Vitals do Search Console, API do CrUX ou BigQuery): é o dado
   que o Google usa. Tem janela de 28 dias, então uma regressão aparece com atraso; o RUM
   avisa antes. Compare o p75 do RUM com o do CrUX por origem: diferença grande indica
   amostragem ou DNT enviesando o RUM.
3. **Lighthouse CI** (laboratório, `pnpm lh`): trava regressão no merge. É o perfil
   "mobile throttled" e **não** substitui o campo (ADR 0020).

**Rotina:** semanal olhar o p75 por rota e viewport; a cada release comparar o RUM do dia
seguinte com o dia anterior; ao entrar um terceiro novo, conferir JS de terceiros (≤ 80 KB)
e hosts (≤ 8) no Lighthouse CI e o INP no RUM.

## 3. Busca orgânica (Search Console)

- **Cobertura:** páginas indexadas vs enviadas no sitemap. Facetas fora de `facets.indexable`
  devem aparecer como "excluída por noindex" (é o esperado, ADR 0021). URLs de produto,
  categoria e landing de cauda longa devem estar indexadas.
- **Melhorias:** `Product` (preço, disponibilidade, avaliações, frete, devolução), `FAQPage`,
  `BreadcrumbList`. Erro em qualquer um bloqueia o rich result: trate como incidente.
- **Desempenho:** impressões, cliques, CTR e posição por tipo de página (categoria, produto,
  landing). Acompanhe consultas de cauda longa que mapeiam para as landings `/b/{palavra-chave}`.
- **Links internos:** uma página sem links de entrada (órfã) é falha. Rastreie o site com um
  crawler uma vez por release e compare com o sitemap.
- **Marca:** busca pelo nome da loja e conferência de NAP (nome, endereço, telefone) em
  Organization, rodapé e perfis de `sameAs`.

## 4. Visibilidade em motores generativos (share of voice)

Não existe API oficial de "quanto sou citado". O método é amostragem repetível:

1. **Lista fixa de perguntas** (30 a 50) que um comprador faria, por categoria: "melhor X para
   Y", "como escolher o tamanho de Z", "X vale a pena?", "onde comprar X com entrega rápida",
   mais perguntas sobre a marca. Versione a lista; mudá-la quebra a série.
2. **Plataformas:** ChatGPT (com busca), Perplexity, Gemini, Copilot e AI Overviews do Google.
   Mesmas perguntas, mesma região e idioma (pt-BR), uma vez por mês no mínimo.
3. **Registre por pergunta e plataforma:** a loja foi citada com link? foi mencionada sem link?
   quais concorrentes aparecem? a informação sobre a loja (preço, prazo, política) está correta?
4. **Indicadores:**
   - *Taxa de citação* = perguntas com link da loja ÷ perguntas.
   - *Share of voice* = citações da loja ÷ citações de todas as marcas nas respostas.
   - *Precisão* = respostas com dado correto sobre a loja ÷ respostas que a mencionam.
5. **Tráfego de volta:** o evento `ai_referral` (`ai_source` = `chatgpt.com`, `perplexity.ai`,
   `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, conforme `geo.attribution`)
   permite contar visitas e conversões vindas de IA no analytics. Sem tag manager o evento é
   publicado e ninguém o lê.
6. **Crawl de agentes:** do log do servidor ou da CDN, conte acessos por user-agent
   (`GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`) a `/llms.txt`,
   `/robots.txt` e páginas de produto. Agente bloqueado em `geo.agents` não deve aparecer
   com sucesso; agente liberado que nunca aparece sugere problema de descoberta.

**Quando a citação cai:** conferir primeiro se o conteúdo indexável ainda existe no HTML sem
JavaScript (`pnpm test:nojs`), se o JSON-LD do `Product` segue completo e se a política de
agentes não mudou. Só depois mexer em texto.

## 5. Painel mínimo e limiares

| Indicador | Fonte | Frequência | Alerta |
| --- | --- | --- | --- |
| LCP, INP, CLS, TTFB p75 por rota e viewport | RUM | diária | acima da meta por 2 dias |
| Core Web Vitals "bom" na origem | CrUX / Search Console | semanal | queda de grupo (bom → precisa melhorar) |
| Erros de rich result | Search Console | semanal | qualquer erro novo |
| Páginas indexadas ÷ enviadas | Search Console | semanal | queda de 10% ou mais |
| Taxa de citação e share of voice em IA | amostragem | mensal | queda de 20% ou mais sobre a média de 3 meses |
| Visitas `ai_referral` | analytics | mensal | tendência, sem limiar fixo |
| Acessos de agentes de IA | log/CDN | semanal | agente liberado sem acesso em 14 dias |

Os limiares de alerta são ponto de partida: ajuste com 4 a 8 semanas de linha de base da loja.
