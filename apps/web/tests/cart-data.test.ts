import { describe, expect, it } from 'vitest';
import { cartSummary, resolveCartLines } from '../lib/data/cart';
import type { Product } from '../lib/data/schemas';

const product = (overrides: Partial<Product> & Pick<Product, 'slug' | 'price'>): Product => ({
  name: `Produto ${overrides.slug}`,
  images: [{ src: '/img.jpg', width: 800, height: 800 }],
  department: 'moda',
  category: 'camisas',
  productType: 'camisa',
  createdAt: '2026-01-01T00:00:00-03:00',
  badges: [],
  specs: [],
  reviews: [],
  variants: [],
  bundle: [],
  related: [],
  availability: 'in_stock',
  ...overrides,
});

describe('resolveCartLines', () => {
  it('junta {sku, quantity} com o produto do catalogo', () => {
    const p = product({ slug: 'camisa-azul', sku: 'SKU-0001', price: 100 });
    const lines = resolveCartLines([{ sku: 'SKU-0001', quantity: 2 }], [p]);
    expect(lines).toEqual([{ sku: 'SKU-0001', quantity: 2, product: p, lineTotal: 200 }]);
  });

  it('SKU que nao existe mais no catalogo e descartado silenciosamente', () => {
    const p = product({ slug: 'camisa-azul', sku: 'SKU-0001', price: 100 });
    const lines = resolveCartLines([{ sku: 'SKU-0001', quantity: 1 }, { sku: 'SKU-descontinuado', quantity: 1 }], [p]);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.sku).toBe('SKU-0001');
  });

  it('produto sem sku cadastrado nunca e encontrado por um item do carrinho (nao entra no indice)', () => {
    const p = product({ slug: 'sem-sku', price: 50 });
    const lines = resolveCartLines([{ sku: 'SKU-0001', quantity: 1 }], [p]);
    expect(lines).toHaveLength(0);
  });

  it('carrinho vazio: nenhuma linha', () => {
    expect(resolveCartLines([], [product({ slug: 'x', sku: 'SKU-0001', price: 10 })])).toEqual([]);
  });
});

describe('cartSummary', () => {
  it('soma quantidade e subtotal de todas as linhas', () => {
    const p1 = product({ slug: 'a', sku: 'SKU-0001', price: 100 });
    const p2 = product({ slug: 'b', sku: 'SKU-0002', price: 30 });
    const lines = resolveCartLines(
      [{ sku: 'SKU-0001', quantity: 2 }, { sku: 'SKU-0002', quantity: 3 }],
      [p1, p2],
    );
    const summary = cartSummary(lines);
    expect(summary.count).toBe(5);
    expect(summary.subtotal).toBe(290);
    expect(summary.lines).toHaveLength(2);
  });

  it('carrinho vazio: count e subtotal zero', () => {
    const summary = cartSummary([]);
    expect(summary).toEqual({ lines: [], count: 0, subtotal: 0 });
  });
});
