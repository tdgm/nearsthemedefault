import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpRelated } from './pdp-related';
import { pdpRelatedSchema } from './pdp-related.schema';

const products = [2, 3, 4].map((n) => ({
  image: { src: `/p${n}.jpg`, width: 600, height: 800 },
  name: `Produto ${n}`,
  href: `/produto-${n}/p`,
  price: 50 + n,
}));

describe('PdpRelated', () => {
  it('h2 com o titulo padrao e lista com um item por produto', () => {
    render(<PdpRelated products={products} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Você também pode gostar' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('link', { name: /Produto 2/ })).toHaveAttribute('href', '/produto-2/p');
  });

  it('titulo customizado (vocabulario da loja)', () => {
    render(<PdpRelated title="Monte seu kit" products={products} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Monte seu kit' })).toBeInTheDocument();
  });

  it('sem produtos a secao some', () => {
    const { container } = render(<PdpRelated products={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('imagens dos cards ficam abaixo da dobra: lazy', () => {
    const { container } = render(<PdpRelated products={products} />);
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('schema: products default [] e valida o card', () => {
    expect(pdpRelatedSchema.parse({}).products).toEqual([]);
    expect(pdpRelatedSchema.safeParse({ products: [{ name: 'x' }] }).success).toBe(false);
  });
});
