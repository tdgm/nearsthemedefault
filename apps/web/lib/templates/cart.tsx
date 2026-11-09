import { Suspense, type ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Button, Image, Link, Skeleton } from '@nears/ui';
import { PdpPickup } from '@nears/sections';
import { CART_COOKIE, decodeCartItems } from '../cart/session';
import { cartSummary, resolveCartLines } from '../data/cart';
import { getProducts } from '../data/client';
import { quoteCartPickup } from '../data/pickup';
import { formatBRL, formatCEP } from '../format';
import { loadConfig, vocab } from '../manifest';
import { buildMetadata } from '../seo';

export const CART_PATH = '/carrinho';

export async function cartMetadata() {
  return buildMetadata({ template: 'carrinho', title: vocab('cartTitle'), description: vocab('cartTitle'), path: CART_PATH });
}

type RawQuery = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * `cookies()` e `searchParams` sao dado de requisicao - com Cache Components
 * (ADR 0007) precisam ficar dentro de `<Suspense>`, senao o build falha ao
 * tentar prerenderizar a rota. Mesmo padrao de `app/account/page.tsx` e de
 * `DynamicFulfillment` em `pdp.tsx`. Nao tem teste de render direto (mesma
 * lacuna aceita de `pdp.tsx`/`DynamicFulfillment`): a logica de negocio fica
 * em `resolveCartLines`/`cartSummary`/`quoteCartPickup` (testados
 * isoladamente); o comportamento visual completo e coberto por
 * `pnpm test:e2e`.
 */
async function CartContent({ searchParams }: { searchParams: Promise<RawQuery> }): Promise<ReactNode> {
  const query = await searchParams;
  const cep = one(query.cep);
  const notice = one(query.aviso);

  const jar = await cookies();
  const items = decodeCartItems(jar.get(CART_COOKIE)?.value);
  const products = await getProducts();
  const lines = resolveCartLines(items, products);
  const summary = cartSummary(lines);
  // SKU que estava no cookie mas nao resolveu contra o catalogo (descontinuado,
  // ou cookie de um preset diferente) - nunca quebra a pagina, so avisa.
  const hasUnavailable = lines.length < items.length;

  const config = loadConfig();
  const pickupEnabled = config.fulfillment.mode !== 'centralized';
  const pickupQuote = pickupEnabled && lines.length > 0 ? await quoteCartPickup(cep, lines.map((l) => l.sku)) : undefined;

  if (lines.length === 0) {
    return (
      <div>
        {hasUnavailable && (
          <p role="status" className="mb-4 text-sm text-danger">
            {vocab('cartItemUnavailable')}
          </p>
        )}
        <p className="mb-6 text-on-surface-muted">{vocab('cartEmpty')}</p>
        <Link href="/" appearance={{ variant: 'primary' }}>
          {vocab('cartContinueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div role="status" className="min-h-6">
        {hasUnavailable && <p className="text-sm text-danger">{vocab('cartItemUnavailable')}</p>}
        {notice === 'atualizado' && <p className="text-sm text-success">{vocab('cartUpdated')}</p>}
        {notice === 'removido' && <p className="text-sm text-success">{vocab('cartItemRemoved')}</p>}
      </div>

      <ul className="divide-y divide-border">
        {lines.map((line) => {
          const image = line.product.images[0];
          return (
            <li key={line.sku} className="flex gap-4 py-4">
              {image && (
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt ?? line.product.name}
                  sizes="96px"
                  className="h-24 w-24 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/${line.product.slug}/p`} className="font-medium">
                  {line.product.name}
                </Link>
                <p className="mt-1 text-sm text-on-surface-muted">{formatBRL(line.product.price)}</p>

                <form method="post" action="/api/cart/items/update" className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="sku" value={line.sku} />
                  <div className="grid gap-1">
                    <label htmlFor={`qtd-${line.sku}`} className="text-sm font-medium">
                      {vocab('cartQuantityLabel')}
                    </label>
                    <input
                      id={`qtd-${line.sku}`}
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={99}
                      defaultValue={line.quantity}
                      className="min-h-11 w-20 rounded-md border border-border-control bg-surface px-3"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    {vocab('cartUpdate')}
                  </Button>
                </form>
                <form method="post" action="/api/cart/items/update" className="mt-2">
                  <input type="hidden" name="sku" value={line.sku} />
                  <input type="hidden" name="quantity" value={0} />
                  <Button type="submit" variant="danger" size="sm">
                    {vocab('cartRemove')}
                  </Button>
                </form>
              </div>
              <p className="shrink-0 font-bold">{formatBRL(line.lineTotal)}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-lg font-bold">
          {vocab('cartSubtotal')} {formatBRL(summary.subtotal)}
        </p>
        <Link href="/checkout" appearance={{ variant: 'primary' }}>
          {vocab('cartCheckout')}
        </Link>
      </div>

      {pickupEnabled && (
        <section id="retirada" aria-labelledby="retirada-titulo" className="mt-8 border-t border-border pt-6">
          <h2 id="retirada-titulo" className="sr-only">
            {vocab('cartTitle')}
          </h2>
          <form method="get" action="#retirada" className="mb-4 flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <label htmlFor="cep" className="text-sm font-medium">
                CEP
              </label>
              <input
                id="cep"
                name="cep"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                pattern="[0-9]{5}-?[0-9]{3}"
                maxLength={9}
                defaultValue={cep ? formatCEP(cep) : undefined}
                placeholder="00000-000"
                className="min-h-11 w-40 rounded-md border border-border-control bg-surface px-3"
              />
            </div>
            <Button type="submit" variant="secondary">
              Calcular
            </Button>
          </form>
          <PdpPickup cep={cep} quote={pickupQuote} />
        </section>
      )}
    </>
  );
}

/**
 * Carrinho de pagina propria (Fase 10, ADR 0029). Shell estatico (so o
 * `<h1>`) + ilha dinamica em `<Suspense>` que le cookie/searchParams -
 * render: ssr, nunca isr/ssg (carrinho e por visitante).
 */
export function CartPage({ searchParams }: { searchParams: Promise<RawQuery> }): ReactNode {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('cartTitle')}</h1>
      <Suspense fallback={<Skeleton shape="rect" className="h-64 w-full" label={vocab('accountLoading')} />}>
        <CartContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
