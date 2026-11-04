import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';

// Storybook 8 com react-vite (CLAUDE.md > Stack). packages/ui nao depende de
// Next, entao nao usamos @storybook/nextjs. Ver docs/adr/0009-fase-0-fundacao.md.
// @tailwindcss/vite so entra no bundle do Storybook (dev tooling): 0 KB no
// cliente de apps/web, que usa @tailwindcss/postcss via next.config (ADR 0011).
const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  async viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
