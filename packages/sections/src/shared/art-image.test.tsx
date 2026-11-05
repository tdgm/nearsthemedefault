import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtImage } from './art-image.tsx';

const desktop = { src: '/d.jpg', width: 1440, height: 560, avif: '/d.avif', webp: '/d.webp' };
const mobile = { src: '/m.jpg', width: 750, height: 900, avif: '/m.avif', webp: '/m.webp' };

describe('ArtImage', () => {
  it('emite AVIF, WebP e fallback por breakpoint, nessa ordem, todos com largura e altura', () => {
    const { container } = render(<ArtImage desktop={desktop} mobile={mobile} alt="Campanha" />);
    const sources = [...container.querySelectorAll('source')];
    expect(sources.map((s) => `${s.getAttribute('media')}|${s.getAttribute('type') ?? 'fallback'}`)).toEqual([
      '(min-width: 768px)|image/avif',
      '(min-width: 768px)|image/webp',
      '(max-width: 767px)|image/avif',
      '(max-width: 767px)|image/webp',
      '(min-width: 768px)|fallback',
    ]);
    for (const s of sources) {
      expect(s.getAttribute('width')).not.toBeNull();
      expect(s.getAttribute('height')).not.toBeNull();
    }
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/m.jpg');
    expect(img).toHaveAttribute('width', '750');
    expect(img).toHaveAttribute('height', '900');
  });

  it('sem avif/webp so ha o fallback (comportamento anterior)', () => {
    const { container } = render(<ArtImage desktop={{ src: '/d.jpg', width: 1, height: 1 }} mobile={{ src: '/m.jpg', width: 1, height: 1 }} alt="x" />);
    expect(container.querySelectorAll('source')).toHaveLength(1);
  });

  it('priority = eager + fetchpriority alto; senao lazy + decoding async', () => {
    const hi = render(<ArtImage desktop={desktop} mobile={mobile} alt="a" priority />).container.querySelector('img')!;
    expect(hi).toHaveAttribute('loading', 'eager');
    expect(hi).toHaveAttribute('fetchpriority', 'high');
    const lo = render(<ArtImage desktop={desktop} mobile={mobile} alt="b" />).container.querySelector('img')!;
    expect(lo).toHaveAttribute('loading', 'lazy');
    expect(lo).toHaveAttribute('decoding', 'async');
    expect(lo).not.toHaveAttribute('fetchpriority');
  });
});
