import type { StorybookConfig } from '@storybook/nextjs';

// Sem stories ainda (packages/ui e packages/sections nascem vazios na Fase
// 0 - ver docs/ROADMAP.md Fase 3/4/5). O glob abaixo so passa a casar algo
// a partir de la.
const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
