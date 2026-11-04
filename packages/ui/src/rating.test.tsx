import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Rating } from './rating';

describe('Rating', () => {
  it('expoe a nota real no texto acessivel, nao so nas estrelas', () => {
    render(<Rating value={4.3} count={128} />);
    expect(screen.getByRole('img', { name: '4.3 de 5 estrelas, 128 avaliações' })).toBeInTheDocument();
  });

  it('sem count, omite a contagem do label', () => {
    render(<Rating value={5} />);
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeInTheDocument();
  });
});
