import { Image, Overlay, buttonClasses, formatBRL } from '@nears/ui';
import { MINICART_ID } from '../header/header.tsx';
import type { MinicartProps } from './minicart.schema';

const defaults = {
  title: 'Carrinho',
  close: 'Fechar carrinho',
  empty: 'Seu carrinho está vazio.',
  continue: 'Continuar comprando',
  subtotal: 'Subtotal',
  viewCart: 'Ver carrinho',
  checkout: 'Finalizar compra',
  quantity: 'Qtd.',
  freeShipping: 'Faltam {value} para frete grátis.',
  freeShippingReached: 'Você ganhou frete grátis!',
  itemsSingular: 'item',
  itemsPlural: 'itens',
} as const;

/**
 * Resumo do carrinho em painel lateral. Renderiza no servidor com os itens que
 * recebe (nada e buscado no load: `cwv.noBlockingFetchOnLoad`). O resumo fica numa
 * regiao `aria-live="polite"`: quando os itens mudam, o leitor de tela anuncia o
 * novo total sem roubar o foco. Cupom, frete por CEP e cross-sell entram na Fase 6
 * (dependem de backend); quantidade e remocao tambem (server actions).
 */
export function Minicart({ items, cartHref = '/carrinho', checkoutHref = '/checkout', continueHref = '/', freeShippingFrom, labels }: MinicartProps) {
  const l = { ...defaults, ...labels };
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const missing = freeShippingFrom !== undefined ? Math.max(0, freeShippingFrom - subtotal) : null;

  return (
    <Overlay id={MINICART_ID} title={l.title} closeLabel={l.close} side="right">
      <div className="flex h-full flex-col">
        <div role="status" aria-live="polite" className="px-4 py-3 text-sm">
          {items.length > 0 ? (
            <>
              <p className="font-medium">
                {count} {count === 1 ? l.itemsSingular : l.itemsPlural} · {l.subtotal} {formatBRL(subtotal)}
              </p>
              {missing !== null && (
                <p className="text-on-surface-muted">
                  {missing > 0 ? l.freeShipping.replace('{value}', formatBRL(missing)) : l.freeShippingReached}
                </p>
              )}
            </>
          ) : (
            <p>{l.empty}</p>
          )}
        </div>

        {items.length > 0 ? (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  {item.image && (
                    <Image src={item.image.src} width={item.image.width} height={item.image.height} alt="" sizes="64px" className="w-16 shrink-0 rounded-md object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {item.href ? (
                        <a href={item.href} className="underline underline-offset-4">
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </p>
                    {item.variant && <p className="text-sm text-on-surface-muted">{item.variant}</p>}
                    <p className="text-sm text-on-surface-muted">
                      {l.quantity} {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold">{formatBRL(item.unitPrice * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 border-t border-border p-4">
              <a href={checkoutHref} className={buttonClasses({ variant: 'primary', fullWidth: true })}>
                {l.checkout}
              </a>
              <a href={cartHref} className={buttonClasses({ variant: 'secondary', fullWidth: true })}>
                {l.viewCart}
              </a>
            </div>
          </>
        ) : (
          <div className="p-4">
            <a href={continueHref} className={buttonClasses({ variant: 'primary', fullWidth: true })}>
              {l.continue}
            </a>
          </div>
        )}
      </div>
    </Overlay>
  );
}

