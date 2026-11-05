import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BenefitBar } from './benefit-bar';
import { benefitBarSchema } from './benefit-bar.schema';

const items = [
  { icon: '✓', label: 'Frete grátis', href: '/frete' },
  { label: 'Troca em 30 dias' },
];

describe('BenefitBar', () => {
  it('e uma regiao nomeada com lista real', () => {
    render(<BenefitBar items={items} />);
    const region = screen.getByRole('region', { name: 'Vantagens' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
  });

  it('item com href vira link de 44px; sem href vira texto', () => {
    render(<BenefitBar items={items} />);
    const link = screen.getByRole('link', { name: /Frete grátis/ });
    expect(link).toHaveAttribute('href', '/frete');
    expect(link.className).toContain('min-h-11');
    expect(screen.getByText('Troca em 30 dias').closest('a')).toBeNull();
  });

  it('icone e decorativo (aria-hidden) e a lista rolavel e focavel', () => {
    const { container } = render(<BenefitBar items={items} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('✓');
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0');
  });

  it('reserva altura minima de 44px', () => {
    render(<BenefitBar items={items} />);
    expect(screen.getByRole('list').className).toContain('min-h-11');
  });

  it('schema exige ao menos um item com label', () => {
    expect(benefitBarSchema.safeParse({ items: [] }).success).toBe(false);
    expect(benefitBarSchema.safeParse({ items: [{ label: '' }] }).success).toBe(false);
    expect(benefitBarSchema.safeParse({ items }).success).toBe(true);
  });
});
