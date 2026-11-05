import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpBundle } from './pdp-bundle';
import { pdpBundleSchema } from './pdp-bundle.schema';

const products = [2, 3, 4].map((n) => ({
  image: { src: `/p${n}.jpg`, width: 600, height: 800 },
  name: `Produto ${n}`,
  href: `/produto-${n}/p`,
  price: 50 + n,
}));

describe('PdpBundle', () => {
  it('h2 com o titulo padrao e lista com um item por produto', () => {
    render(<PdpBundle products={products} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Compre junto' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('link', { name: /Produto 2/ })).toHaveAttribute('href', '/produto-2/p');
  });

  it('titulo customizado (vocabulario da loja)', () => {
    render(<PdpBundle title="Monte seu kit" products={products} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Monte seu kit' })).toBeInTheDocument();
  });

  it('sem produtos a secao some', () => {
    const { container } = render(<PdpBundle products={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('imagens dos cards ficam abaixo da dobra: lazy', () => {
    const { container } = render(<PdpBundle products={products} />);
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('schema: products default [] e valida o card', () => {
    expect(pdpBundleSchema.parse({}).products).toEqual([]);
    expect(pdpBundleSchema.safeParse({ products: [{ name: 'x' }] }).success).toBe(false);
  });
});
