import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renderiza o texto e responde ao clique', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Comprar</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('loading desabilita o clique mas mantem o texto acessivel', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} loading>Comprar</Button>);
    const button = screen.getByRole('button', { name: 'Comprar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled desabilita o clique', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Comprar</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
