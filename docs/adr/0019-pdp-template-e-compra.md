# ADR 0019 - Template da PDP, frete por CEP e adicionar ao carrinho (Fase 6c)

- Status: aceito
- Data: 2026-11-05

## Contexto

A PDP e a rota de maior valor e a mais sensivel a Core Web Vitals: LCP na galeria, CLS no
buy box e no CTA fixo, INP no adicionar ao carrinho. O template `pdp` do manifest lista
sete sections proprias (`pdp-gallery`, `pdp-buybox`, `pdp-shipping`, `pdp-details`,
`pdp-reviews`, `pdp-bundle`, `pdp-related`) mais `breadcrumb` e `faq`. Orcamento de JS da
rota: 140 KB gzip (ADR 0010).

## Decisao

1. **Galeria sem JS.** Slides sao uma faixa com `scroll-snap` nativo; miniaturas sao
   ancoras `#pdp-img-N`. A 1a foto e eager com `fetchpriority="high"` (candidata a LCP), as
   demais lazy. O zoom e um `<dialog>` nativo por foto (`Overlay side="center"`), aberto por
   `OverlayTrigger`, a ilha que o header ja envia: zero JS novo. A imagem ampliada e lazy
   dentro do dialogo fechado, entao so baixa ao abrir.
2. **Buy box: uma ilha minima.** `AddToCartForm` ("use client", justificado no arquivo) so
   cuida de enviar o formulario sem recarregar e anunciar o resultado em
   `aria-live="polite"`. Os seletores de variacao chegam como `children` do servidor e cada
   eixo e um `radiogroup` com `required` nativo (validacao funciona sem JS). A regiao viva fica
   sempre no DOM com altura reservada: nenhum layout shift. Sem estoque ou sem endpoint, o CTA
   fica desabilitado.
3. **CTA fixo no mobile.** Barra `position: fixed` de 72px (`stickyReservedHeight`), ligada ao
   formulario pelo atributo `form`; no desktop o botao fica no fluxo. So um dos dois aparece
   (`display: none` tira o outro da arvore de acessibilidade). A pagina reserva `72px` de
   padding; o botao de atendimento sobe 72px via `--nears-sticky-offset` (`body:has([data-sticky-bar])`).
4. **Frete por CEP: formulario GET.** `?cep=...#frete` funciona sem JS; o resultado e HTML
   (`role="status"`, altura minima de 96px). Como `cacheComponents` so permite ler a URL em
   `Suspense`, a section roda em `Suspense` e o `fallback` e a propria section sem resultado:
   o shell da PDP continua estatico e nao ha shift quando a cotacao chega. A cotacao e um mock
   deterministico em `lib/data/shipping.ts` (a real e do backend, via GraphQL).
5. **Adicionar ao carrinho.** `POST /api/cart/items` e mock que valida com Zod. Responde JSON
   a `fetch` e `303` de volta (mesma origem) a envio de formulario sem JS. O carrinho real e do
   backend; este repo nao guarda estado de compra.
6. **Conteudo.** `lib/templates/pdp-content.ts` converte `Product` em props. Eixos de variacao,
   guia e tabela de specs vem de `catalog`; rotulos de `vocabulary`. O `alt` das fotos e gerado
   por regra (`buildAlt`) e nunca vem cru do CMS. Descricao, specs e guia sao HTML semantico
   (`<table>` com `scope`), nunca imagem.
7. **Header da PDP.** Segue `full`. A variante `minimal` (`headerVariant` do manifest) exige
   decidir o header por rota no layout raiz; isso pede grupos de rota e mexer em `appRoute`, no
   teste do manifest e no mapa de budgets, sem ganho de performance. Fica registrada como
   divida para a Fase 8, sem custo de CWV. **Resolvido no ADR 0025:** o header segue `full` e os manifests passam a dizer o mesmo.

## Consequencias

- Peso: a PDP so adiciona o JS de `AddToCartForm` e `VariantSelector` (rota propria); o bundle
  das demais rotas nao muda. Medido por `pnpm validate` (check-budgets, rota `pdp`).
- JSON-LD `Product` (`aggregateRating`, `shippingDetails`, `hasMerchantReturnPolicy`), canonical
  e `FAQPage` da PDP entram na Fase 7; os dados ja chegam nas sections.
- Sem eixos em `catalog.variantAxes` (preset generico) nao ha seletor; presets por nicho em
  ADR 0002 definem os eixos.
