import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['apps/web/app/**', 'apps/web/lib/**', 'packages/*/src/**'],
    },
  },
});
