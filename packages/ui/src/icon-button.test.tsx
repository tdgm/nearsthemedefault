import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconButton } from './icon-button';

describe('IconButton', () => {
  it('expoe o nome acessivel so pelo aria-label', () => {
    render(<IconButton icon={<svg aria-hidden="true" />} aria-label="Fechar" />);
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });
});
