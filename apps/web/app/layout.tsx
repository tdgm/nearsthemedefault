import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

// Placeholder de metadata - helper tipado em /lib/seo chega na Fase 7
// (CLAUDE.md > SEO e GEO). Nada aqui e identidade de marca: so o minimo
// pra pagina ter title/description validos desde a Fase 0.
export const metadata: Metadata = {
  title: 'Nears',
  description: 'Template padrao white-label da plataforma Nears.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
