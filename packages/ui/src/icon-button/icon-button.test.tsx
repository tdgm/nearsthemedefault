import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconButton } from './icon-button';

const icon = <svg data-testid="icon" />;

describe('IconButton', () => {
  it('usa label como nome acessivel e esconde o icone', () => {
    render(<IconButton label="Favoritos" icon={icon} />);
    expect(screen.getByRole('button', { name: 'Favoritos' })).toBeInTheDocument();
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('inclui a quantidade no nome acessivel (singular e plural)', () => {
    const { rerender } = render(<IconButton label="Carrinho" icon={icon} badge={1} />);
    expect(screen.getByRole('button', { name: 'Carrinho, 1 item' })).toBeInTheDocument();
    rerender(<IconButton label="Carrinho" icon={icon} badge={4} />);
    expect(screen.getByRole('button', { name: 'Carrinho, 4 itens' })).toBeInTheDocument();
  });

  it('limita o contador visual a 99+', () => {
    render(<IconButton label="Carrinho" icon={icon} badge={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
    // O nome acessivel contem o texto visivel do contador (WCAG 2.5.3).
    expect(screen.getByRole('button', { name: 'Carrinho, 99+ itens' })).toBeInTheDocument();
  });

  it('badge 0 nao aparece e tem alvo de 44px', () => {
    render(<IconButton label="Carrinho" icon={icon} badge={0} />);
    const button = screen.getByRole('button', { name: 'Carrinho' });
    expect(button).toHaveClass('size-11');
    expect(button.querySelectorAll('span')).toHaveLength(1);
  });
});
