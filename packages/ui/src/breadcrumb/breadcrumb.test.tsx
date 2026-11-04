import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumb } from './breadcrumb';

const items = [
  { label: 'Início', href: '/' },
  { label: 'Camisetas', href: '/camisetas' },
  { label: 'Camiseta básica' },
];

describe('Breadcrumb', () => {
  it('e um landmark nav com nome', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Você está em' })).toBeInTheDocument();
  });

  it('usa lista ordenada com um item por nivel', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('o ultimo item e a pagina atual e nao e link', () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText('Camiseta básica');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.closest('a')).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('separadores sao aria-hidden', () => {
    const { container } = render(<Breadcrumb items={items} />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('aceita label customizado', () => {
    render(<Breadcrumb items={items} label="Trilha" />);
    expect(screen.getByRole('navigation', { name: 'Trilha' })).toBeInTheDocument();
  });
});
