import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// `globals: false` desliga o auto-cleanup do Testing Library; sem isto os
// renders de um teste vazam para o proximo.
afterEach(() => {
  cleanup();
});
