/* eslint-disable */
// GERADO por packages/tokens/build.mjs a partir de tokens.json. NAO edite a mao.
import localFont from 'next/font/local';

// Uma familia variavel, self-hosted, font-display: swap, preload do unico
// arquivo (peso 400 incluso). size-adjust/ascent/descent/line-gap do fallback
// sao calculados no build pelo next/font (adjustFontFallback), nunca a mao.
// Fonte: Inter (OFL-1.1).
const brand = localFont({
  src: '../../../../packages/tokens/fonts/brand-variable.woff2',
  weight: '400 700',
  display: 'swap',
  preload: true,
  variable: '--font-brand',
  adjustFontFallback: 'Arial',
});

export const fontVariableClass = brand.variable;
