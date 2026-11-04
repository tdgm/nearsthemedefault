import tailwindcss from '@tailwindcss/postcss';
import type { StorybookConfig } from '@storybook/react-vite';

// Storybook 8 com react-vite (CLAUDE.md > Stack). packages/ui nao depende de
// Next, entao nao usamos @storybook/nextjs. Ver docs/adr/0009-fase-0-fundacao.md.
const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // PostCSS explicito (nao depende de descoberta de postcss.config): o Tailwind 4
  // le os tokens via packages/ui/src/styles.css (docs/adr/0013).
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    css: { ...viteConfig.css, postcss: { plugins: [tailwindcss()] } },
  }),
};

export default config;
