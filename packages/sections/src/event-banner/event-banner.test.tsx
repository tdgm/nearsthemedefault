import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EventBanner } from './event-banner';
import { eventBannerSchema } from './event-banner.schema';

const props = {
  imageDesktop: { src: '/d.jpg', width: 1440, height: 320 },
  imageMobile: { src: '/m.jpg', width: 720, height: 360 },
  alt: 'Liquidacao de inverno',
  href: '/campanha/liquidacao',
};

describe('EventBanner', () => {
  it('picture com source desktop e img mobile, ambos com dimensoes', () => {
    const { container } = render(<EventBanner {...props} />);
    const source = container.querySelector('source')!;
    expect(source).toHaveAttribute('media', '(min-width: 768px)');
    expect(source).toHaveAttribute('srcset', '/d.jpg');
    expect(source).toHaveAttribute('width', '1440');
    expect(source).toHaveAttribute('height', '320');
    const img = screen.getByAltText('Liquidacao de inverno');
    expect(img).toHaveAttribute('src', '/m.jpg');
    expect(img).toHaveAttribute('width', '720');
    expect(img).toHaveAttribute('height', '360');
  });

  it('abaixo da dobra: lazy e decoding async', () => {
    render(<EventBanner {...props} />);
    const img = screen.getByAltText('Liquidacao de inverno');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('com href a imagem e um link nomeado pelo alt; sem href nao ha link', () => {
    const { rerender } = render(<EventBanner {...props} />);
    expect(screen.getByRole('link', { name: 'Liquidacao de inverno' })).toHaveAttribute('href', '/campanha/liquidacao');
    rerender(<EventBanner {...props} href={undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('declara content-visibility auto e tamanho intrinseco', () => {
    const { container } = render(<EventBanner {...props} />);
    const cls = container.querySelector('section')!.className;
    expect(cls).toContain('[content-visibility:auto]');
    expect(cls).toContain('contain-intrinsic-size');
  });

  it('schema: alt obrigatorio e imagens com dimensoes', () => {
    expect(eventBannerSchema.safeParse({ ...props, alt: '' }).success).toBe(false);
    expect(eventBannerSchema.safeParse({ ...props, imageMobile: { src: '/m.jpg' } }).success).toBe(false);
    expect(eventBannerSchema.safeParse(props).success).toBe(true);
  });
});
