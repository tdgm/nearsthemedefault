import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RelatedLinks } from './related-links';
import { relatedLinksSchema } from './related-links.schema';

const links = [
  { label: 'Camisetas femininas', href: '/feminino/camisetas' },
  { label: 'Regatas', href: '/regatas' },
];

describe('RelatedLinks', () => {
  it('e um nav nomeado pelo titulo, com h2 e lista de links reais', () => {
    render(<RelatedLinks links={links} />);
    const nav = screen.getByRole('navigation', { name: 'Veja também' });
    expect(within(nav).getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(within(nav).getByRole('link', { name: 'Regatas' })).toHaveAttribute('href', '/regatas');
  });

  it('links tem alvo de 44px', () => {
    render(<RelatedLinks links={links} />);
    screen.getAllByRole('link').forEach((a) => expect(a.className).toContain('min-h-11'));
  });

  it('titulo customizado nomeia o landmark', () => {
    render(<RelatedLinks title="Categorias" links={links} />);
    expect(screen.getByRole('navigation', { name: 'Categorias' })).toBeInTheDocument();
  });

  it('schema rejeita ancora generica (case-insensitive)', () => {
    expect(relatedLinksSchema.safeParse({ links: [{ label: 'Clique aqui', href: '/x' }] }).success).toBe(false);
    expect(relatedLinksSchema.safeParse({ links: [{ label: ' saiba mais ', href: '/x' }] }).success).toBe(false);
    expect(relatedLinksSchema.safeParse({ links }).success).toBe(true);
  });
});
