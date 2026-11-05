import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CustomerService, Footer, Header, Minicart, NavDrawer, PromoBar } from '@nears/sections';
import { getStorefront } from '../lib/storefront';
import { loadConfig } from '../lib/manifest';
import { fontVariableClass } from './_generated/fonts';
import './globals.css';

const config = loadConfig();

export const metadata: Metadata = {
  title: 'Nears — template padrão',
  description: 'Template padrão white-label das lojas Nears (em construção).',
  // Placeholders nao podem ser indexados. Remover na Fase 7 (SEO e GEO), quando
  // o robots por template passa a vir de contracts.yaml.
  robots: { index: false, follow: false },
};

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
      </body>
    </html>
  );
}
