import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Minicart } from './minicart';
import { minicartSchema } from './minicart.schema';

const items = [
  { id: '1', name: 'Camiseta básica', href: '/camiseta/p', variant: 'Azul / M', quantity: 2, unitPrice: 50 },
  { id: '2', name: 'Calça', quantity: 1, unitPrice: 100 },
];

// O <dialog> fechado sai da arvore de acessibilidade: as queries usam `hidden: true`
// (o conteudo existe no DOM/HTML inicial, so nao e anunciado ate abrir).
describe('Minicart', () => {
  it('e um dialog id=minicart, fechado e nomeado', () => {
    const { container } = render(<Minicart items={items} />);
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('id', 'minicart');
    expect(dialog).toHaveAttribute('aria-labelledby', 'minicart-title');
    expect(dialog).not.toHaveAttribute('open');
  });

  it('resumo em regiao aria-live polite: contagem e subtotal', () => {
    render(<Minicart items={items} />);
    const status = screen.getByRole('status', { hidden: true });
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent(/3 itens/);
    expect(status).toHaveTextContent(/Subtotal R\$\s200,00/);
  });

  it('singular para um unico item', () => {
    render(<Minicart items={[{ id: '1', name: 'x', quantity: 1, unitPrice: 10 }]} />);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(/1 item ·/);
  });

  it('lista itens com variacao, quantidade e total da linha', () => {
    render(<Minicart items={items} />);
    expect(screen.getByRole('link', { name: 'Camiseta básica', hidden: true })).toHaveAttribute('href', '/camiseta/p');
    expect(screen.getByText('Azul / M')).toBeInTheDocument();
    expect(screen.getByText('Qtd. 2')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s100,00/, { selector: 'p.font-bold' })).toBeInTheDocument();
  });

  it('CTAs levam ao checkout e ao carrinho', () => {
    render(<Minicart items={items} checkoutHref="/checkout" cartHref="/carrinho" />);
    expect(screen.getByRole('link', { name: 'Finalizar compra', hidden: true })).toHaveAttribute('href', '/checkout');
    expect(screen.getByRole('link', { name: 'Ver carrinho', hidden: true })).toHaveAttribute('href', '/carrinho');
  });

  it('estado vazio: mensagem e link para continuar comprando, sem CTA de checkout', () => {
    render(<Minicart items={[]} continueHref="/novidades" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Seu carrinho está vazio.');
    expect(screen.getByRole('link', { name: 'Continuar comprando', hidden: true })).toHaveAttribute('href', '/novidades');
    expect(screen.queryByRole('link', { name: 'Finalizar compra', hidden: true })).toBeNull();
  });

  it('frete gratis: mostra quanto falta e depois a confirmacao', () => {
    const { rerender } = render(<Minicart items={items} freeShippingFrom={500} />);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(/Faltam R\$\s300,00 para frete grátis/);
    rerender(<Minicart items={items} freeShippingFrom={150} />);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Você ganhou frete grátis!');
  });

  it('imagem do item e decorativa (alt vazio) e tem dimensoes', () => {
    const { container } = render(
      <Minicart items={[{ id: '1', name: 'x', quantity: 1, unitPrice: 1, image: { src: '/a.jpg', width: 64, height: 80 } }]} />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('width', '64');
  });

  it('microcopy do nicho via labels', () => {
    render(<Minicart items={[]} labels={{ title: 'Sacola', empty: 'Sacola vazia.' }} />);
    expect(screen.getByRole('heading', { name: 'Sacola', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Sacola vazia.');
  });
});

describe('minicartSchema', () => {
  it('valida itens e rejeita quantidade zero ou negativa', () => {
    expect(minicartSchema.safeParse({ items }).success).toBe(true);
    expect(minicartSchema.safeParse({ items: [{ id: '1', name: 'x', quantity: 0, unitPrice: 1 }] }).success).toBe(false);
    expect(minicartSchema.safeParse({ items: [{ id: '1', name: 'x', quantity: 1, unitPrice: -1 }] }).success).toBe(false);
  });
});
