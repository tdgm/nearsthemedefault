import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Image } from './image';

describe('Image', () => {
  it('sempre declara width/height e aspect-ratio (CLAUDE.md > Performance)', () => {
    render(<Image src="/produto.jpg" alt="Produto" width={400} height={500} />);
    const img = screen.getByRole('img', { name: 'Produto' });
    expect(img).toHaveAttribute('width', '400');
    expect(img).toHaveAttribute('height', '500');
    expect(img.style.aspectRatio).toBe('400 / 500');
  });

  it('priority usa eager/sync/high; sem priority usa lazy/async/auto', () => {
    const { rerender } = render(<Image src="/a.jpg" alt="A" width={1} height={1} priority />);
    const img = screen.getByRole('img', { name: 'A' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');

    rerender(<Image src="/a.jpg" alt="A" width={1} height={1} />);
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('fetchpriority', 'auto');
  });

  it('inclui <source> de avif e webp quando fornecidos', () => {
    const { container } = render(
      <Image src="/a.jpg" alt="A" width={1} height={1} avifSrc="/a.avif" webpSrc="/a.webp" />,
    );
    const sources = container.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
  });
});
