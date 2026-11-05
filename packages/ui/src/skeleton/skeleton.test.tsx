import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('sem label e escondido de leitores de tela', () => {
    const { container } = render(<Skeleton shape="text" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('com label anuncia o carregamento via role=status', () => {
    render(<Skeleton label="Carregando produto" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando produto');
  });

  it.each([
    ['text', 'rounded-sm'],
    ['rect', 'rounded-md'],
    ['circle', 'rounded-full'],
  ] as const)('forma %s', (shape, cls) => {
    const { container } = render(<Skeleton shape={shape} />);
    expect(container.firstChild).toHaveClass(cls);
  });
});
