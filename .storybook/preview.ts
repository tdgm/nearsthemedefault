import type { Preview } from '@storybook/react';
import '../packages/ui/src/styles.css';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
  globalTypes: {
    theme: {
      description: 'Tema (tokens claro/escuro)',
      toolbar: { title: 'Tema', icon: 'circlehollow', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = String(context.globals.theme ?? 'light');
      return Story();
    },
  ],
};

export default preview;
