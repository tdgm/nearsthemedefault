import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BreadcrumbSection } from './breadcrumb';
import { breadcrumbSchema } from './breadcrumb.schema';

const items = [{ label: 'Início', href: '/' }, { label: 'Feminino', href: '/feminino' }, { label: 'Camisetas' }];

describe('Breadcrumb (section)', () => {
  it('e um landmark navigation nomeado', () => {
    render(<BreadcrumbSection items={items} />);
    expect(screen.getByRole('navigation', { name: 'Você está em' })).toBeInTheDocument();
  });

  it('aceita nome de landmark customizado', () => {
    render(<BreadcrumbSection items={items} label="Trilha" />);
    expect(screen.getByRole('navigation', { name: 'Trilha' })).toBeInTheDocument();
  });

  it('marca a pagina atual sem link', () => {
    render(<BreadcrumbSection items={items} />);
    expect(screen.getByText('Camisetas')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('schema exige ao menos um item', () => {
    expect(breadcrumbSchema.safeParse({ items: [] }).success).toBe(false);
    expect(breadcrumbSchema.safeParse({ items }).success).toBe(true);
  });
});
