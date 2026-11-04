import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  it('marca o ultimo item como pagina atual e sem link', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Início', href: '/' },
          { label: 'Tênis' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    const current = screen.getByText('Tênis');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Tênis' })).not.toBeInTheDocument();
  });
});
