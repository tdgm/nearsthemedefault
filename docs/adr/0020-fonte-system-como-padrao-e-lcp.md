# ADR 0020 - Fonte `system` como padrao e o gate de LCP (Fase 6)

- Status: aceito
- Data: 2026-11-05
- Atualiza: ADR 0001, 0011 e 0016 (so o valor padrao de `typography.font.brand.source`)

## Contexto

Com a home, a colecao e a PDP reais, o job `Core Web Vitals` (Lighthouse CI, mobile,
4G lento simulado: 1,6 Mbps, RTT 150 ms, CPU 4x) mediu LCP de 2,1 a 2,3 s na home e na
colecao contra o limite de 2,0 s. TBT, CLS e a PDP passavam. O hero passou a ser o
elemento LCP, com `fetchpriority="high"` e o pedido descoberto no HTML inicial, entao o
problema nao e descoberta nem prioridade da imagem.

No modelo simulado do Lighthouse (Lantern) o LCP nao e so "imagem": ele soma o que e
baixado antes dele no mesmo canal de 1,6 Mbps. Bytes criticos da home, gzip:

| Recurso | KB |
| --- | --- |
| JS inicial (React, Next e islands) | 139,3 |
| Fonte Inter `woff2` (latin + latin-ext) | 75,8 |
| HTML | 15,3 |
| CSS | 8,2 |
| Imagem do hero (mobile, AVIF) | 16,7 |

Cerca de 255 KB a 1,6 Mbps sao 1,25 s so de transferencia, mais os RTTs. A fonte e o maior
item que podemos evitar sem tirar funcionalidade, e e a unica que o preload poe na frente
da imagem do hero na fila.

## Decisao

1. `typography.font.brand.source` volta a **`system`** no template padrao: zero download,
   pilha websafe (ADR 0001), sem `size-adjust` a calcular e sem troca de fonte (CLS 0).
   Isso tira ~76 KB (cerca de 0,37 s no modelo simulado) do caminho critico.
2. **Fonte de marca continua suportada** e pre-aprovada: a loja que quer tipografia propria
   troca `source` para `self-hosted` em `tokens.json` (o Inter 4.1 OFL-1.1 segue em
   `packages/tokens/fonts/`, com a licenca). O build de tokens, o schema Zod e os testes ja
   cobrem os dois modos.
3. Para marcas que ligarem `self-hosted`, o caminho de menor custo e um subset **so latin**
   (pt-BR nao usa latin-ext): estimativa de 35 a 40 KB a menos, ~0,2 s. Fica registrado como
   ajuste por marca, nao como padrao do template.
4. O gate de LCP **continua em 2,0 s**: nao relaxamos limite para fazer o build passar.
5. O CI passa a guardar `.lighthouseci` como artefato (`lighthouse-reports`, 7 dias): o
   relatorio sobe para um storage publico temporario que o repo nao alcanca, e sem o trace
   nao da para ver o elemento LCP nem a cascata.

## Consequencias

- O template padrao perde a identidade tipografica do Inter; a identidade visual do
  template ja e deliberadamente neutra (CLAUDE.md), e cada marca define a sua.
- A decisao e reversivel por token: `source: self-hosted`. Quem reativar paga ~0,37 s de LCP
  simulado e deve compensar (subset latin, menos JS) para manter o gate.
- Medicao local de Lighthouse e confiavel so em maquina ociosa (TBT acima de 400 ms invalida
  o LCP); o veredito do gate e o CI. Um servidor antigo na porta 3000 ja mascarou uma
  medicao (o `lhci` mede o que estiver respondendo); conferir `lsof -iTCP:3000` antes de
  rodar `pnpm lh`.
- Se o LCP ainda ficar acima de 2,0 s com `system`, os proximos candidatos sao o JS
  inicial (139,3 de 140 KB, sem folga) e o CSS critico inline.
