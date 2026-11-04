import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { loadConfig } from '../lib/manifest';
import './globals.css';

const config = loadConfig();

export const metadata: Metadata = {
  title: 'Nears — template padrão',
  description: 'Template padrão white-label das lojas Nears (em construção).',
  // Placeholders nao podem ser indexados. Remover na Fase 7 (SEO e GEO), quando
  // o robots por template passa a vir de contracts.yaml.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={config.locale.default}>
      <body>{children}</body>
    </html>
  );
}
