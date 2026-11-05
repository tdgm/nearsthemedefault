import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpShipping } from './pdp-shipping';
import { pdpShippingSchema } from './pdp-shipping.schema';

const quote = {
  options: [
    { id: 'p', name: 'Padrão', price: 19.9, days: [3, 5] as [number, number] },
    { id: 'r', name: 'Retirada', price: 0, days: [1, 1] as [number, number] },
  ],
};

describe('PdpShipping', () => {
  it('formulario GET sem JS: campo com label, numerico, obrigatorio e dica associada', () => {
    const { container } = render(<PdpShipping />);
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '#frete');
    const input = screen.getByLabelText('CEP');
    expect(input).toHaveAttribute('name', 'cep');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'postal-code');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Só números, 8 dígitos.');
  });

  it('exibe opcoes com prazo e preco; gratis para R$ 0', () => {
    render(<PdpShipping cep="01310100" quote={quote} />);
    expect(screen.getByLabelText('CEP')).toHaveValue('01310-100');
    expect(screen.getByText('3 a 5 dias úteis', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('R$ 19,90')).toBeInTheDocument();
    expect(screen.getByText('Grátis')).toBeInTheDocument();
    expect(screen.getByText('1 dias úteis', { exact: false })).toBeInTheDocument();
  });

  it('erro: campo invalido e erro associado por aria-describedby', () => {
    render(<PdpShipping cep="12" quote={{ error: 'CEP inválido' }} />);
    const input = screen.getByLabelText('CEP');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('CEP inválido');
  });

  it('reserva altura para o resultado e mantem o id #frete', () => {
    const { container } = render(<PdpShipping />);
    expect(container.querySelector('#frete')).not.toBeNull();
    expect(screen.getByRole('status')).toHaveClass('min-h-24');
  });

  it('zipInput=false esconde o formulario; link de ajuda abre em nova aba com rel seguro', () => {
    const { container, rerender } = render(<PdpShipping zipInput={false} />);
    expect(container.querySelector('form')).toBeNull();
    rerender(<PdpShipping helpHref="https://example.com" />);
    expect(screen.getByRole('link', { name: 'Não sei meu CEP' })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('schema: quote aceita opcoes OU erro, nunca vazio', () => {
    expect(pdpShippingSchema.safeParse({ quote }).success).toBe(true);
    expect(pdpShippingSchema.safeParse({ quote: { error: 'x' } }).success).toBe(true);
    expect(pdpShippingSchema.safeParse({ quote: { options: [] } }).success).toBe(false);
  });
});
