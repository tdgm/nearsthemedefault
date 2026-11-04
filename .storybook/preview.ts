import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
};

export default preview;
