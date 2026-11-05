import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('liga o label ao campo', () => {
    render(<Input label="E-mail" />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('dica fica ligada por aria-describedby', () => {
    render(<Input label="CEP" hint="Somente numeros" />);
    expect(screen.getByLabelText('CEP')).toHaveAccessibleDescription('Somente numeros');
  });

  it('erro marca aria-invalid, e descrito e anunciado (role=alert)', () => {
    render(<Input label="CEP" hint="Dica" error="CEP invalido" />);
    const input = screen.getByLabelText('CEP');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Dica CEP invalido');
    expect(screen.getByRole('alert')).toHaveTextContent('CEP invalido');
  });

  it('sem erro nao ha aria-invalid nem alerta', () => {
    render(<Input label="CEP" />);
    expect(screen.getByLabelText('CEP')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('obrigatorio mostra o texto e usa required nativo', () => {
    render(<Input label="Nome" required />);
    expect(screen.getByLabelText(/Nome/)).toBeRequired();
    expect(screen.getByText('(obrigatório)')).toBeInTheDocument();
  });

  it('desabilitado e alvo minimo de 44px', () => {
    render(<Input label="Nome" disabled />);
    const input = screen.getByLabelText('Nome');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('min-h-11');
  });
});
