import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Price } from './price';

describe('Price', () => {
  it('mostra apenas o preco quando nao ha desconto', () => {
    render(<Price price={99.9} />);
    expect(screen.getByText(/99,90/)).toBeInTheDocument();
    expect(screen.queryByText('Por')).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('de/por: preco cheio riscado, textos para leitor de tela e % off', () => {
    const { container } = render(<Price price={80} listPrice={100} />);
    expect(container.querySelector('s')).toHaveTextContent(/100,00/);
    expect(screen.getByText('De', { exact: false })).toHaveClass('sr-only');
    expect(screen.getByText('Por', { exact: false })).toHaveClass('sr-only');
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('ignora preco cheio igual ou menor que o preco de venda', () => {
    const { container } = render(<Price price={100} listPrice={100} />);
    expect(container.querySelector('s')).toBeNull();
  });

  it('esconde o selo quando showDiscount e false', () => {
    render(<Price price={80} listPrice={100} showDiscount={false} />);
    expect(screen.queryByText('-20%')).not.toBeInTheDocument();
  });

  it('parcelamento sem juros', () => {
    render(<Price price={120} installments={{ count: 3 }} />);
    expect(screen.getByText(/3x de R\$\s40,00 sem juros/)).toBeInTheDocument();
  });

  it('nao mostra parcelamento para 1x', () => {
    render(<Price price={120} installments={{ count: 1 }} />);
    expect(screen.queryByText(/sem juros/)).not.toBeInTheDocument();
  });
});
