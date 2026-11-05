# ADR 0022 - RUM de Core Web Vitals

Status: aceita (Fase 8)

## Contexto

Os orçamentos de LCP/INP/CLS/TTFB (p75 mobile) são verificados em laboratório pelo
Lighthouse CI, mas o que importa é o campo. A Fase 8 pede RUM. Restrições:

- O JS inicial da rota crítica está em 139,3 KB de 140 KB (ADR 0010): sobra menos de
  1 KB, então um coletor no bundle (ex.: `web-vitals`, ~2 KB gzip) estoura o orçamento.
- Terceiros pagam custo em hosts e em JS (limites 8 hosts / 80 KB) e exigem ADR.
- Frontend puro: este repo não guarda dado de usuário nem opera um coletor.

## Decisão

1. **Coletor inline, ES5, sem dependência** (`lib/rum/script.ts`), injetado por um Server
   Component (`RumScript`) no fim do `<body>`: ~1,5 KB no HTML (limite 80 KB), 0 KB no
   bundle de JS, sem requisição extra, sem dependência nova. Determinístico, então uma
   CSP por hash (Fase 8d) libera exatamente este texto.
2. **Métricas:** LCP (último candidato), FCP, TTFB (`responseStart` da navegação), CLS pela
   janela de sessão (gap de 1 s, máximo 5 s, ignora `hadRecentInput`) e INP como a pior
   interação com duração >= 40 ms. Para páginas com menos de 50 interações a pior é o INP
   do spec; em sessões longas ela superestima o p98 (erro para o lado conservador).
   Navegadores sem o tipo de entrada simplesmente não reportam a métrica (CLS não vira 0
   falso no Safari).
3. **Envio:** `navigator.sendBeacon` quando a aba fica oculta (`visibilitychange`) ou em
   `pagehide`; reenvia só se o conjunto de valores mudou. Payload `{p, v, m}`: pathname
   (sem query string, que pode conter termo de busca), `m`/`d` (viewport < 768 px) e as
   métricas. Sem cookie, sem identificador, sem IP guardado aqui.
4. **Privacidade:** não roda com Do Not Track nem Global Privacy Control; amostragem por
   `sampleRate` (0..1) para lojas de alto tráfego.
5. **Contrato validado nos dois lados:** `rumPayloadSchema` (Zod estrito: campo
   desconhecido é erro, o que impede um identificador de entrar por acidente) e
   `POST /api/rum`, que responde 204/400/413 e **descarta** o beacon (mock do template).
   Quem opera uma loja troca `observability.rum.endpoint` por uma URL https do coletor
   da Nears (o schema aceita só `/caminho` ou `https://`). Um coletor externo conta como
   host de terceiro no orçamento e deve ser citado no ADR da loja.
6. **Configuração declarativa:** `nears.config.yaml > observability.rum`
   (`enabled`, `endpoint`, `sampleRate`), validada no schema do manifest.

## Alternativas descartadas

- `web-vitals` (Google) no bundle: ~2 KB gzip, estoura os 140 KB; carregá-lo com
  `import()` tardio perde LCP/CLS que acontecem antes do carregamento.
- Dependência de RUM de fornecedor (Datadog, SpeedCurve...): terceiro com JS e host,
  exigiria Partytown e ADR por loja; o template fica neutro e deixa o endpoint trocável.
- `PerformanceObserver` dentro de um componente cliente: entra no bundle.

## Consequências

- HTML +~1,5 KB em toda rota (16,9 KB de 80 KB na home); JS e CSS inalterados.
- O mock não persiste nada: sem coletor configurado o RUM só valida o contrato. Isso é
  intencional e está dito aqui, não é uma métrica real até a loja apontar o endpoint.
- Plano de medição (CrUX, Search Console, share of voice em IA) fica no onboarding (8d).
