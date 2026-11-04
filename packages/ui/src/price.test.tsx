import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Price } from './price';

describe('Price', () => {
  it('mostra so o preco quando nao ha desconto', () => {
    render(<Price value={100} />);
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('mostra preco de, por e percentual quando ha desconto', () => {
    render(<Price value={80} listValue={100} />);
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 80,00')).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('mostra o parcelamento formatado', () => {
    render(<Price value={100} installments={{ count: 3, valuePerInstallment: 33.33 }} />);
    expect(screen.getByText('3x de R$ 33,33 sem juros')).toBeInTheDocument();
  });
});
