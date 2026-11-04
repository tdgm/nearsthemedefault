import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // Local: PW_CHANNEL=chrome usa o Chrome instalado. Necessario em macOS que o
    // Playwright nao suporta (ex.: macOS 12 nao baixa o Chromium dele). No CI
    // a variavel nao existe e vale o Chromium do Playwright.
    channel: process.env.PW_CHANNEL || undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mesmos testes com JavaScript desligado: todo conteudo indexavel precisa
    // existir no HTML inicial (CLAUDE.md > SEO e GEO).
    { name: 'nojs', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
  ],
  webServer: {
    // Producao de verdade (e o que o Lighthouse mede). Localmente reaproveita
    // o servidor que ja estiver na porta (ex.: `pnpm dev`).
    command: 'pnpm build && pnpm start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
