import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { CartButton, CustomerService, Footer, Header, Minicart, NavDrawer, PromoBar, SkipLink, type MinicartProps } from '@nears/sections';
import { getCartAwareChrome, getStorefront } from '../lib/storefront';
import { getStore } from '../lib/data/client';
import { loadAllManifests, loadConfig } from '../lib/manifest';
import { RumScript } from '../lib/rum';
import { ThirdPartyScripts } from '../lib/third-party';
import { AiReferralScript, siteUrl } from '../lib/seo';
import { fontVariableClass } from './_generated/fonts';
import './globals.css';

const config = loadConfig();

// Base do layout: metadataBase (resolve URLs relativas), nome da loja e o sufixo
// de titulo de contracts.yaml > seo.global.titleTemplate. Robots, canonical e OG
// vem de buildMetadata em cada template (lib/seo), nunca daqui.
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const { titleTemplate } = loadAllManifests().contracts.seo.global;
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: store.name,
    title: { default: store.name, template: titleTemplate.replace('{page}', '%s').replace('{brand}', () => store.name) },
  };
}

/**
 * `cartCount`/`items` reais dependem do cookie `nears_cart` - dado de
 * requisicao, que com Cache Components (ADR 0007) so pode ser lido dentro de
 * um `Suspense` (mesmo padrao de `app/account/page.tsx`). `getStorefront()`
 * continua 100% estatica (ela e usada por TODA rota do site); so estas ilhas
 * leem o carrinho (Fase 10, ADR 0029).
 *
 * `CartButtonLive` e uma ilha PROPRIA so em volta do botao de carrinho
 * (`Header`'s `cartTrigger`), nunca em volta do `Header` inteiro: o `Header`
 * tambem tem o botao "Menu" (abre o `NavDrawer`), que nao depende do carrinho
 * e precisa ficar 100% estatico - envolver o `Header` inteiro num unico
 * `Suspense` fazia o streaming trocar esse botao de DOM a cada request,
 * perdendo o foco entre `focus()` e `Enter` no e2e de teclado (addendum
 * nesta ADR). O fallback de cada `Suspense` e exatamente o mesmo render
 * estatico de hoje (`cartCount: 0`/`items: []`) - zero layout shift quando o
 * resultado chega.
 */
async function CartButtonLive({ label }: { label: string }) {
  const { cartCount } = await getCartAwareChrome();
  return <CartButton cartCount={cartCount} label={label} />;
}

async function CartAwareMinicart({ minicart }: { minicart: MinicartProps }) {
  const { items } = await getCartAwareChrome();
  return <Minicart {...minicart} items={items} />;
}

// Sections globais (docs/adr/0014). Variante do header: `full` em todas as rotas
// (docs/adr/0025: `minimal` por rota exigiria grupos de rota; resolveHeaderVariant segue
// disponivel e testada). `#conteudo` e o destino do skip link.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getStorefront();
  const cartLabel = s.header.labels?.cart ?? 'Carrinho';
  return (
    <html lang={config.locale.default} className={fontVariableClass}>
      <body>
        {/* Primeiro item focavel da pagina: antes da PromoBar (docs/adr/0026). */}
        <SkipLink {...(s.header.labels?.skip ? { label: s.header.labels.skip } : {})} />
        <PromoBar {...s.promoBar} />
        <Header
          {...s.header}
          skipLink={false}
          cartTrigger={
            <Suspense fallback={<CartButton label={cartLabel} />}>
              <CartButtonLive label={cartLabel} />
            </Suspense>
          }
        />
        <div id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer {...s.footer} />
        <NavDrawer {...s.navDrawer} />
        <Suspense fallback={<Minicart {...s.minicart} />}>
          <CartAwareMinicart minicart={s.minicart} />
        </Suspense>
        <CustomerService {...s.customerService} />
        <AiReferralScript />
        <RumScript />
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
