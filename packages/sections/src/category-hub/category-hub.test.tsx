import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoryHub } from './category-hub';
import { categoryHubSchema } from './category-hub.schema';

const item = (n: number, fromPrice?: number) => ({
  image: { src: `/c${n}.jpg`, width: 480, height: 600 },
  label: `Categoria ${n}`,
  fromPrice,
  href: `/c${n}`,
});
const items = Array.from({ length: 8 }, (_, i) => item(i + 1, 29.9));

describe('CategoryHub', () => {
  it('mostra no maximo 6 cards por padrao, como links reais no HTML', () => {
    render(<CategoryHub items={items} />);
    const region = screen.getByRole('region', { name: 'Compre por categoria' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(6);
    expect(within(region).getByRole('link', { name: /Categoria 1\b/ })).toHaveAttribute('href', '/c1');
    expect(within(region).queryByRole('link', { name: /Categoria 7/ })).toBeNull();
  });

  it('respeita limit', () => {
    render(<CategoryHub items={items} limit={3} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('preco a partir de formatado em BRL; sem preco nao mostra o texto', () => {
    const { rerender } = render(<CategoryHub items={[item(1, 29.9)]} />);
    expect(screen.getByRole('link')).toHaveTextContent(/a partir de R\$\s?29,90/);
    rerender(<CategoryHub items={[item(1)]} />);
    expect(screen.getByRole('link')).not.toHaveTextContent('a partir de');
  });

  it('imagem decorativa (o nome do link e o label), com dimensoes e lazy', () => {
    const { container } = render(<CategoryHub items={[item(1, 10)]} />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('width', '480');
    expect(img).toHaveAttribute('height', '600');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('faixa rolavel e focavel; links com alvo de 44px', () => {
    render(<CategoryHub items={items} />);
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0');
    screen.getAllByRole('link').forEach((a) => expect(a.className).toContain('min-h-11'));
  });

  it('schema: items obrigatorio e limit padrao 6', () => {
    expect(categoryHubSchema.safeParse({ items: [] }).success).toBe(false);
    expect(categoryHubSchema.parse({ items }).limit).toBe(6);
  });
});
