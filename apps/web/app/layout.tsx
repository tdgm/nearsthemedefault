import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CustomerService, Footer, Header, Minicart, NavDrawer, PromoBar } from '@nears/sections';
import { getStorefront } from '../lib/storefront';
import { getStore } from '../lib/data/client';
import { loadAllManifests, loadConfig } from '../lib/manifest';
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

// Sections globais (docs/adr/0014). Variante do header: `full` em todas as rotas por
// enquanto; a variante `minimal` da PDP (`*/p`) entra com o template real na Fase 6
// (resolveHeaderVariant ja existe e e testada). `#conteudo` e o destino do skip link.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getStorefront();
  return (
    <html lang={config.locale.default} className={fontVariableClass}>
      <body>
        <PromoBar {...s.promoBar} />
        <Header {...s.header} />
        <div id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer {...s.footer} />
        <NavDrawer {...s.navDrawer} />
        <Minicart {...s.minicart} />
        <CustomerService {...s.customerService} />
        <AiReferralScript />
      </body>
    </html>
  );
}
