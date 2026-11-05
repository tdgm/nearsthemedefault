import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PdpBuybox } from './pdp-buybox';
import { pdpBuyboxSchema } from './pdp-buybox.schema';

const colors = {
  id: 'color',
  label: 'Cor',
  display: 'swatch' as const,
  options: [
    { value: 'azul', label: 'Azul', swatch: '#1b4d89' },
    { value: 'verde', label: 'Verde', unavailable: true },
  ],
};
const base = { name: 'Camiseta', price: 100, sku: 'S1', addToCartAction: '/api/cart/items' };

afterEach(() => vi.restoreAllMocks());

describe('PdpBuybox', () => {
  it('tem o unico h1 da pagina, preco e parcelamento', () => {
    render(<PdpBuybox {...base} installments={{ count: 4 }} listPrice={150} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Camiseta' })).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    expect(screen.getByText('4x de R$ 25,00 sem juros')).toBeInTheDocument();
  });

  it('cada eixo e um radiogroup obrigatorio; indisponivel fica desabilitado', () => {
    render(<PdpBuybox {...base} variantSelectors={[colors]} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeRequired();
    expect(radios[1]).toBeDisabled();
  });

  it('avaliacao so aparece com contagem; link ancora para #avaliacoes', () => {
    const { rerender } = render(<PdpBuybox {...base} />);
    expect(screen.queryByRole('link', { name: 'Ver avaliações' })).toBeNull();
    rerender(<PdpBuybox {...base} rating={{ value: 4.5, count: 10 }} />);
    expect(screen.getByRole('link', { name: 'Ver avaliações' })).toHaveAttribute('href', '#avaliacoes');
    expect(screen.getByText(/Avaliação 4,5 de 5, 10 avaliações/)).toBeInTheDocument();
  });

  it('CTA vem do vocabulario e existe uma regiao viva polite sempre no DOM', () => {
    render(<PdpBuybox {...base} cta="Adicionar à sacola" />);
    expect(screen.getAllByRole('button', { name: 'Adicionar à sacola', hidden: true }).length).toBeGreaterThan(0);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('');
  });

  it('barra fixa mobile liga o botao ao formulario (atributo form) e pode ser desligada', () => {
    const { container, rerender } = render(<PdpBuybox {...base} />);
    const form = container.querySelector('form')!;
    const bar = container.querySelector('[data-sticky-bar]')!;
    expect(bar.querySelector('button')).toHaveAttribute('form', form.id);
    expect(bar).toHaveTextContent('R$ 100,00');
    rerender(<PdpBuybox {...base} stickyMobile={false} />);
    expect(container.querySelector('[data-sticky-bar]')).toBeNull();
  });

  it('sem estoque: CTA desabilitado com rotulo proprio; sem endpoint tambem', () => {
    const { rerender } = render(<PdpBuybox {...base} availability="out_of_stock" />);
    for (const b of screen.getAllByRole('button', { name: 'Indisponível', hidden: true })) expect(b).toBeDisabled();
    rerender(<PdpBuybox {...base} addToCartAction={undefined} />);
    for (const b of screen.getAllByRole('button', { name: 'Adicionar ao carrinho', hidden: true })) expect(b).toBeDisabled();
  });

  it('adicionar: envia POST e anuncia o resultado em aria-live', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    const { container } = render(<PdpBuybox {...base} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Adicionado ao carrinho.'));
    expect(fetchMock).toHaveBeenCalledWith('/api/cart/items', expect.objectContaining({ method: 'POST' }));
  });

  it('falha de rede/servidor: anuncia o erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 500 }));
    const { container } = render(<PdpBuybox {...base} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Não foi possível adicionar'));
  });

  it('schema: variantSelectors default [] e disponibilidade validada', () => {
    const parsed = pdpBuyboxSchema.parse(base);
    expect(parsed.variantSelectors).toEqual([]);
    expect(parsed.availability).toBe('in_stock');
    expect(pdpBuyboxSchema.safeParse({ ...base, availability: 'x' }).success).toBe(false);
  });
});
