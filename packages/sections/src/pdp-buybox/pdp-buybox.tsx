import { Badge, Price, Rating, VariantSelector, buttonClasses, formatBRL } from '@nears/ui';
import { AddToCartForm } from './add-to-cart-form.tsx';
import type { PdpBuyboxProps } from './pdp-buybox.schema';

const defaults = {
  sku: 'Código',
  reviews: 'Ver avaliações',
  guide: 'Ver guia',
  outOfStock: 'Indisponível',
  preorder: 'Pré-venda',
  adding: 'Adicionando…',
  added: 'Adicionado ao carrinho.',
  addError: 'Não foi possível adicionar. Tente de novo.',
  unavailable: 'indisponível',
} as const;

/**
 * Caixa de compra da PDP. O titulo e o unico H1 da pagina. Preco, parcelamento e
 * seletores vem renderizados no servidor; so o formulario (envio + aria-live) e
 * uma ilha. Cada eixo de variacao e um `radiogroup` obrigatorio. O CTA fica numa
 * barra fixa de 72px no mobile (`stickyMobile`) e no fluxo normal no desktop.
 */
export function PdpBuybox({
  name,
  rating,
  price,
  listPrice,
  installments,
  availability = 'in_stock',
  sku,
  addToCartAction,
  variantSelectors = [],
  guideHref,
  cta = 'Adicionar ao carrinho',
  stickyMobile = true,
  labels,
}: PdpBuyboxProps) {
  const l = { ...defaults, ...labels };
  const out = availability === 'out_of_stock';
  return (
    <section aria-labelledby="pdp-title" className="grid content-start gap-4 py-4 lg:sticky lg:top-4">
      <div className="grid gap-2">
        <h1 id="pdp-title" className="text-2xl font-heading text-balance md:text-3xl">
          {name}
        </h1>
        {sku && (
          <p className="text-sm text-on-surface-muted">
            {l.sku}: {sku}
          </p>
        )}
        {rating && rating.count > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Rating value={rating.value} count={rating.count} />
            <a href="#avaliacoes" className="min-h-11 content-center text-sm underline underline-offset-4">
              {l.reviews}
            </a>
          </div>
        )}
        {availability === 'preorder' && <Badge tone="info">{l.preorder}</Badge>}
      </div>

      <Price price={price} listPrice={listPrice} installments={installments} size="lg" />

      <AddToCartForm
        action={addToCartAction}
        sku={sku}
        cta={cta}
        disabledLabel={out ? l.outOfStock : undefined}
        buttonClass={buttonClasses({ size: 'lg', fullWidth: true })}
        barPrice={formatBRL(price)}
        stickyMobile={stickyMobile}
        labels={{ adding: l.adding, added: l.added, addError: l.addError }}
      >
        {variantSelectors.map((axis) => (
          <VariantSelector
            key={axis.id}
            name={axis.id}
            legend={axis.label}
            display={axis.display}
            options={axis.options}
            unavailableLabel={l.unavailable}
            required
          />
        ))}
        {guideHref && (
          <a href={guideHref} className="min-h-11 content-center justify-self-start text-sm underline underline-offset-4">
            {l.guide}
          </a>
        )}
      </AddToCartForm>
    </section>
  );
}
