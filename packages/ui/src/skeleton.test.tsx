import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('fica oculto de leitores de tela', () => {
    const { container } = render(<Skeleton aspectRatio="1 / 1" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.aspectRatio).toBe('1 / 1');
  });
});
