import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BannerGrid } from './banner-grid';
import { bannerGridSchema } from './banner-grid.schema';

const banners = [
  { image: { src: '/a.jpg', width: 640, height: 800 }, alt: 'Camisetas a partir de R$ 49', href: '/a' },
  { image: { src: '/b.jpg', width: 640, height: 800 }, alt: 'Jeans em 6x' },
];

describe('BannerGrid', () => {
  it('lista real; banner com href e link nomeado pelo alt', () => {
    render(<BannerGrid banners={banners} />);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Camisetas a partir de R$ 49' })).toHaveAttribute('href', '/a');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('toda imagem tem alt, dimensoes e carrega lazy', () => {
    render(<BannerGrid banners={banners} />);
    for (const img of screen.getAllByRole('img')) {
      expect(img).toHaveAttribute('alt');
      expect(img).toHaveAttribute('width', '640');
      expect(img).toHaveAttribute('height', '800');
      expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  it.each([
    ['2', 'md:grid-cols-2'],
    ['3', 'md:grid-cols-3'],
    ['4', 'lg:grid-cols-4'],
  ] as const)('columns=%s usa %s', (columns, cls) => {
    render(<BannerGrid columns={columns} banners={banners} />);
    expect(screen.getByRole('list').className).toContain(cls);
  });

  it('schema: colunas so 2|3|4 (padrao 3) e alt obrigatorio', () => {
    expect(bannerGridSchema.safeParse({ columns: '5', banners }).success).toBe(false);
    expect(bannerGridSchema.parse({ banners }).columns).toBe('3');
    expect(bannerGridSchema.safeParse({ banners: [{ ...banners[0], alt: '' }] }).success).toBe(false);
  });
});
