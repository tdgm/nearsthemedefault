// Flat config (padrao do ESLint 9 / Next 16 - "next lint" foi removido,
// ver docs/adr/0007-nextjs-16.md). FlatCompat traduz os presets
// "next/core-web-vitals" e "next/typescript", que ainda sao publicados no
// formato legado pelo eslint-config-next.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  {
    ignores: [
      '**/.next/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.lighthouseci/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
