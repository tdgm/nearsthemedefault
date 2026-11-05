import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination, pageWindow } from './pagination';

const hrefFor = (p: number) => (p === 1 ? '/c' : `/c?page=${p}`);

describe('pageWindow', () => {
  it('lista tudo quando cabe', () => expect(pageWindow(2, 3, 1)).toEqual([1, 2, 3]));
  it('insere reticencias nos dois lados', () => expect(pageWindow(10, 20, 1)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]));
  it('colada ao inicio: reticencias so no lado distante', () => expect(pageWindow(3, 10, 1)).toEqual([1, 2, 3, 4, 'gap', 10]));
  it('respeita siblings', () => expect(pageWindow(10, 20, 2)).toEqual([1, 'gap', 8, 9, 10, 11, 12, 'gap', 20]));
});

describe('Pagination', () => {
  it('nao renderiza com uma unica pagina', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('usa links reais com URLs indexaveis', () => {
    render(<Pagination currentPage={2} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole('link', { name: 'Página 1' })).toHaveAttribute('href', '/c');
    expect(screen.getByRole('link', { name: 'Página 3' })).toHaveAttribute('href', '/c?page=3');
  });

  it('marca a pagina atual com aria-current', () => {
    render(<Pagination currentPage={2} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('anterior e proxima trazem rel prev/next', () => {
    render(<Pagination currentPage={2} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole('link', { name: 'Página anterior' })).toHaveAttribute('rel', 'prev');
    expect(screen.getByRole('link', { name: 'Próxima página' })).toHaveAttribute('rel', 'next');
  });

  it('na primeira pagina o anterior fica desabilitado e sem link', () => {
    render(<Pagination currentPage={1} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Página anterior' })).toBeNull();
    expect(screen.getByText('Página anterior').parentElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('na ultima pagina a proxima fica desabilitada', () => {
    render(<Pagination currentPage={5} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Próxima página' })).toBeNull();
    expect(screen.getByText('Próxima página').parentElement).toHaveAttribute('aria-disabled', 'true');
  });

  it('e um landmark nav', () => {
    render(<Pagination currentPage={1} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
  });
});
