import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  webServer: {
    // Builda e serve a propria app antes dos testes: os jobs `test` e `e2e`
    // do ci.yml correm em runners separados do job `budgets`, sem artefato
    // de build compartilhado entre eles.
    command: 'pnpm --filter web build && pnpm --filter web start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'nojs',
      // CLAUDE.md > SEO e GEO: todo conteudo indexavel tem que existir no
      // HTML inicial. So roda o spec de indexabilidade - o de axe precisa
      // de JS pra injetar o scanner.
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      testMatch: /home\.spec\.ts/,
    },
  ],
});
