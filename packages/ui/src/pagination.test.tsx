import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('nao renderiza nada com 1 pagina ou menos', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} buildHref={(p) => `?page=${p}`} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('marca a pagina atual com aria-current', () => {
    render(<Pagination currentPage={2} totalPages={3} buildHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('marca rel=prev/next nos vizinhos da pagina atual', () => {
    render(<Pagination currentPage={2} totalPages={3} buildHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('rel', 'prev');
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('rel', 'next');
  });

  it('monta o href de cada pagina via buildHref', () => {
    render(<Pagination currentPage={1} totalPages={2} buildHref={(p) => `/categoria/tenis?page=${p}`} />);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/categoria/tenis?page=2');
  });
});
