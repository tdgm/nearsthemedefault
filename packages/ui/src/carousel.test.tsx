import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Carousel } from './carousel';

describe('Carousel', () => {
  it('expoe role=region com o label e renderiza os itens', () => {
    render(
      <Carousel label="Produtos relacionados">
        <div>Item 1</div>
        <div>Item 2</div>
      </Carousel>,
    );
    expect(screen.getByRole('region', { name: 'Produtos relacionados' })).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('as setas nao quebram ao clicar (scrollBy nativo, sem lib)', () => {
    render(
      <Carousel label="Itens">
        <div>Item 1</div>
      </Carousel>,
    );
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Próximos itens' }))).not.toThrow();
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Itens anteriores' }))).not.toThrow();
  });
});
