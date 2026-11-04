import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchForm } from '../components/search-form';
import { SearchStatus } from '../components/search-status';

const labels = {
  empty: 'Digite um termo',
  noResults: 'Nenhum resultado para',
  noResultsHint: 'Tente termos mais gerais',
};

describe('SearchStatus', () => {
  it('sem termo mostra so o estado vazio', () => {
    render(<SearchStatus query="" labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent('Digite um termo');
    expect(screen.queryByText(/Nenhum resultado/)).not.toBeInTheDocument();
  });

  it('com termo mostra "sem resultados", o termo e a dica', () => {
    render(<SearchStatus query="camiseta" labels={labels} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Nenhum resultado para «camiseta»');
    expect(status).toHaveTextContent('Tente termos mais gerais');
  });

  it('renderiza o termo como texto, nunca como HTML', () => {
    const { container } = render(<SearchStatus query={'<img src=x onerror=alert(1)>'} labels={labels} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('<img src=x onerror=alert(1)>');
  });
});

describe('SearchForm', () => {
  const props = { action: '/s', label: 'O que você procura?', placeholder: 'Digite', submit: 'Buscar' };

  it('e um formulario GET de busca com campo rotulado e botao', () => {
    render(<SearchForm {...props} />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/s');
    expect(screen.getByRole('searchbox', { name: 'O que você procura?' })).toHaveAttribute('name', 'q');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('mantem o termo atual no campo', () => {
    render(<SearchForm {...props} defaultValue="camiseta" />);
    expect(screen.getByRole('searchbox')).toHaveValue('camiseta');
  });
});
