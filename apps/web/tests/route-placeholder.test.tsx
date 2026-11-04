import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoutePlaceholder } from '../components/route-placeholder';

// next/link depende do runtime do Next; basta um <a> para o teste de estrutura.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('RoutePlaceholder', () => {
  it('tem um unico H1 com o id da rota', () => {
    render(<RoutePlaceholder id="pdp" template="pdp" />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('pdp');
  });

  it('usa landmark main e link de volta ao painel', () => {
    render(<RoutePlaceholder id="search" template="search" />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /painel de evolução/i })).toHaveAttribute('href', '/');
  });
});
