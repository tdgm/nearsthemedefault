# 0031 - Linguagem visual padrao mais proxima da referencia estrutural (sem copiar marca)

## Status

Aceita.

## Contexto

Pedido do dono do projeto: deixar o CSS dos elementos de interface mais
proximo do site usado como referencia estrutural (hering.com.br). O
`CLAUDE.md` proibe copiar identidade visual, textos, imagens ou codigo de
terceiros, entao o que foi feito e medir a **linguagem de forma** dos
elementos (estilos computados de botao, campo, selo, preco, titulo e card, na
home e na PDP, em 2026-11-09) e traduzir so o que e generico para tokens.

O que a referencia usa, em resumo:

| Elemento | Medido na referencia | Template antes |
| --- | --- | --- |
| Botao | pilula (raio 999px), preto, peso 400, 40/48px | raio 8px, cinza-azulado escuro, peso 500 |
| Campo de texto | pilula, 48px, padding 20px | raio 8px, 44px, padding 12px |
| Selo / chip | raio 4px | raio 4px |
| Card e imagem | sem raio, sem sombra | raio 8px em alguns |
| Titulos | peso 400 | peso 700 |
| Preco promocional | cor do texto, selo de % verde | laranja, selo laranja |
| Links | cor do texto | azul da marca |
| Neutros | cinzas acromaticos | cinzas azulados |

## Decisao

Tudo via `packages/tokens/tokens.json`; nenhum valor literal em componente.

1. **Paleta da propria Nears** (ver "Marca padrao" abaixo), nao a da referencia.
2. **Raio**: `sm` 2px, `md` 4px, `lg` 8px e o novo `radius.control` (9999px),
   usado por Button, Input, Select e Pagination (`rounded-control`). Marca de
   cantos retos troca um token.
3. **Peso**: novos `typography.weight.heading` e `.control` (400), expostos
   como `font-heading` e `font-control`. Titulos (h1/h2) e rotulo de botao
   usam esses tokens em vez de `font-bold`/`font-medium`. Preco passa a 500.
4. **Semanticos**: `action` = neutral.1000 (hover neutral.800); `link`,
   `price-sale` e `badge-promo-bg` = laranja escuro (700); `focus-ring` = 600.
5. **Campo**: 48px de altura e padding horizontal de 20px (pilula precisa de
   mais respiro lateral).

## Marca padrao: Nears

A forma vem da referencia; a cor e o logo vem da Nears (pedido do dono, a
partir do painel `painel.nears.com.br`, medido em 2026-11-10):

- **Laranja `#F26F35`** vira `brand.500`/`accent.500`, com rampa 50-900.
  Branco sobre `#F26F35` da 2,9:1, entao texto e selo usam o tom 700
  (`#B3410F`, 5,7:1) e o anel de foco o 600 (`#D9531A`, 4,0:1).
- **Azul-marinho `#0F172A` / `#111827`** vira neutral.1000/900: e a cor do
  botao primario (branco sobre ele: 17,9:1) e do texto. Neutros em cinza frio.
- **Logo**: `apps/web/public/logo-nears.png` (160x160, exibido a 32px de
  altura no header) substitui o placeholder "LOJA". Vem do dado da loja
  (`store.logo`), nao de componente: cada loja troca pelo seu.
- **Fonte**: o painel usa Roboto (Apache-2.0, permitida pela ADR 0001). O
  template segue em `system` (zero download, ADR 0020); adotar Roboto custa
  ~76 KB no caminho critico e fica como decisao a parte.

## O que NAO foi copiado (de proposito)

- **Fonte**: a referencia usa uma familia proprietaria. O template segue em
  `system` (ADR 0020) e so aceita OFL/Apache (ADR 0001).
- **Borda de controle `#B3B3B3`**: da 2,1:1 sobre branco, abaixo dos 3:1 da
  WCAG 1.4.11. `border-control` continua em neutral.500 (gate `tokens:contrast`).
- **Botao de 40px e opcao de tamanho sem borda**: furam o alvo de 44px e a
  regra de limite visivel do controle. Mantidos como estavam.
- Logo, cores de campanha, imagens, textos e codigo.

## Consequencias

- `packages/tokens/dist/*` regenerado; testes do build de tokens atualizados
  para o novo neutral.500 (`#667085`, 4,97:1 sobre branco).
- Qualquer loja volta ao visual anterior, ou a outro, so trocando tokens.
