import type { StorybookConfig } from '@storybook/react-vite';

// Storybook 8 com react-vite (CLAUDE.md > Stack). packages/ui nao depende de
// Next, entao nao usamos @storybook/nextjs. Ver docs/adr/0009-fase-0-fundacao.md.
const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
};

export default config;
