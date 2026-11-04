// ESLint 9 flat config (Next 16 removeu `next lint`; docs/adr/0007).
// `any` e erro (CLAUDE.md > Codigo).
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.lighthouseci/**',
      '**/next-env.d.ts',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    // Next.js so enxerga o app; em um monorepo o plugin precisa saber onde.
    settings: { next: { rootDir: ['apps/web/'] } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
);
