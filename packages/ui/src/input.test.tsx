import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('liga a label ao campo', () => {
    render(<Input label="E-mail" />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('associa a dica via aria-describedby', () => {
    render(<Input label="CEP" hint="Formato 00000-000" />);
    const input = screen.getByLabelText('CEP');
    const hintId = input.getAttribute('aria-describedby');
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId!)).toHaveTextContent('Formato 00000-000');
  });

  it('marca aria-invalid e associa o erro quando ha erro', () => {
    render(<Input label="E-mail" error="E-mail invalido" />);
    const input = screen.getByLabelText('E-mail');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail invalido');
  });
});
