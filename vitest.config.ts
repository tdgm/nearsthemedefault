import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    // 15s (default e 5s): alguns testes renderizam o template inteiro (home,
    // pdp) ou iteram o catalogo completo (seo) em jsdom, e ja rodam perto de
    // 4.5-4.8s sem nenhuma contencao (confirmado isolando-os na main). Sob a
    // carga normal de `pnpm validate` (lint+typecheck+build concorrentes),
    // isso virava timeout intermitente sem relacao com o codigo da fase em
    // questao. Ver docs/adr/0027, nota de implementacao da Fase 9c.
    testTimeout: 15000,
    include: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx,mjs}', 'scripts/**/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['apps/web/app/**', 'apps/web/lib/**', 'packages/*/src/**'],
    },
  },
});
