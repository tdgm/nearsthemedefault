import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CustomerService } from './customer-service';
import { customerServiceSchema } from './customer-service.schema';

const channels = [
  { label: 'WhatsApp', href: 'https://wa.me/55', description: 'Seg. a sex.' },
  { label: 'E-mail', href: 'mailto:a@b.c' },
];

describe('CustomerService', () => {
  it('flutuante (fixed) e fechado por padrao: nao ocupa espaco no fluxo', () => {
    const { container } = render(<CustomerService channels={channels} />);
    const details = container.querySelector('details')!;
    expect(details).toHaveClass('fixed');
    expect(details).not.toHaveAttribute('open');
  });

  it('botao tem nome acessivel e pelo menos 44px', () => {
    const { container } = render(<CustomerService channels={channels} />);
    const summary = container.querySelector('summary')!;
    expect(summary).toHaveAttribute('aria-label', 'Atendimento');
    expect(summary).toHaveClass('size-14');
  });

  it('lista os canais como links com descricao, cada um com 44px', () => {
    render(<CustomerService channels={channels} />);
    const link = screen.getByRole('link', { name: /WhatsApp/ });
    expect(link).toHaveAttribute('href', 'https://wa.me/55');
    expect(link).toHaveClass('min-h-11');
    expect(screen.getByText('Seg. a sex.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'E-mail' })).toBeInTheDocument();
  });

  it('microcopy do nicho via labels', () => {
    const { container } = render(<CustomerService channels={channels} labels={{ open: 'Ajuda', title: 'Precisa de ajuda?' }} />);
    expect(container.querySelector('summary')).toHaveAttribute('aria-label', 'Ajuda');
    expect(screen.getByText('Precisa de ajuda?')).toBeInTheDocument();
  });
});

describe('customerServiceSchema', () => {
  it('exige ao menos um canal', () => {
    expect(customerServiceSchema.safeParse({ channels }).success).toBe(true);
    expect(customerServiceSchema.safeParse({ channels: [] }).success).toBe(false);
  });
});
