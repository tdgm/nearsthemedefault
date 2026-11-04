import type { Preview } from '@storybook/react';
import '../packages/ui/src/styles.css';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
};

export default preview;
