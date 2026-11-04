import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Image, buildAlt, type ImageLoader } from './image';

const loader: ImageLoader = (src, w, fmt) => `${src}?w=${w}&f=${fmt}`;

describe('Image', () => {
  it('sempre declara width, height e aspect-ratio', () => {
    render(<Image src="/a.jpg" alt="Camiseta" width={800} height={1000} />);
    const img = screen.getByAltText('Camiseta');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '1000');
    expect(img).toHaveStyle({ aspectRatio: '800 / 1000' });
  });

  it('abaixo da dobra: lazy + decoding async, sem fetchpriority', () => {
    render(<Image src="/a.jpg" alt="x" width={10} height={10} />);
    const img = screen.getByAltText('x');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).not.toHaveAttribute('fetchpriority');
  });

  it('acima da dobra: eager + fetchpriority=high', () => {
    render(<Image src="/a.jpg" alt="x" width={10} height={10} priority />);
    const img = screen.getByAltText('x');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('com loader gera <picture> com AVIF, WebP e fallback', () => {
    const { container } = render(<Image src="/a.jpg" alt="x" width={10} height={10} loader={loader} widths={[320, 640]} sizes="50vw" />);
    const sources = container.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[0]).toHaveAttribute('srcset', '/a.jpg?w=320&f=avif 320w, /a.jpg?w=640&f=avif 640w');
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
    expect(screen.getByAltText('x')).toHaveAttribute('srcset', '/a.jpg?w=320&f=original 320w, /a.jpg?w=640&f=original 640w');
  });

  it('sem loader nao cria <picture>', () => {
    const { container } = render(<Image src="/a.jpg" alt="x" width={10} height={10} />);
    expect(container.querySelector('picture')).toBeNull();
  });

  it('imagem decorativa aceita alt vazio explicito', () => {
    const { container } = render(<Image src="/a.jpg" alt="" width={10} height={10} />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('buildAlt', () => {
  it('junta nome, variacao e marca', () => {
    expect(buildAlt({ name: 'Camiseta básica', variantValues: ['Azul', 'M'], brand: 'Nears' })).toBe('Camiseta básica Azul M Nears');
  });
  it('nao repete termos', () => {
    expect(buildAlt({ name: 'Camiseta azul', variantValues: ['Azul'] })).toBe('Camiseta azul');
  });
  it('ignora partes vazias', () => {
    expect(buildAlt({ name: 'Tênis', brand: '' })).toBe('Tênis');
  });
});
