import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Rating } from './rating';

describe('Rating', () => {
  it('oferece alternativa em texto com nota e total', () => {
    render(<Rating value={4.5} count={128} />);
    expect(screen.getByText('Avaliação 4,5 de 5, 128 avaliações')).toHaveClass('sr-only');
  });

  it('singular para uma avaliacao', () => {
    render(<Rating value={5} count={1} />);
    expect(screen.getByText(/1 avaliação$/)).toBeInTheDocument();
  });

  it('sem total omite a contagem', () => {
    render(<Rating value={3} />);
    expect(screen.getByText('Avaliação 3,0 de 5')).toBeInTheDocument();
  });

  it('estrelas sao decorativas (aria-hidden)', () => {
    const { container } = render(<Rating value={4} />);
    container.querySelectorAll('svg').forEach((svg) => expect(svg.closest('[aria-hidden="true"]')).not.toBeNull());
  });

  it('limita a nota entre 0 e 5', () => {
    render(<Rating value={9} />);
    expect(screen.getByText('Avaliação 5,0 de 5')).toBeInTheDocument();
  });
});
