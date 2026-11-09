import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckoutStubPage } from '../lib/templates/checkout';

describe('/checkout (stub - Fase 10, ADR 0029)', () => {
  it('um unico H1 e um landmark main, nunca um fluxo de pagamento de verdade', () => {
    render(<CheckoutStubPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.queryByRole('form')).toBeNull();
  });

  it('avisa que o checkout de verdade e do backend/painel e linka de volta pro carrinho', () => {
    render(<CheckoutStubPage />);
    expect(screen.getByText(/backend\/painel/)).toBeInTheDocument();
    const back = screen.getByRole('link');
    expect(back).toHaveAttribute('href', '/carrinho');
  });
});
