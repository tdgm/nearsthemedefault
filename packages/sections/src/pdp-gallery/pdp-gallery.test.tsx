import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpGallery } from './pdp-gallery';
import { pdpGallerySchema } from './pdp-gallery.schema';

const images = [1, 2, 3].map((n) => ({ src: `/p${n}.jpg`, width: 900, height: 1200, alt: `Foto ${n}` }));

describe('PdpGallery', () => {
  it('1a foto eager com fetchpriority alto; as demais lazy; todas com width/height', () => {
    render(<PdpGallery images={images} />);
    const [first, second, third] = screen.getAllByRole('img', { hidden: false }).filter((i) => i.getAttribute('alt')?.startsWith('Foto'));
    expect(first).toHaveAttribute('fetchpriority', 'high');
    expect(first).toHaveAttribute('loading', 'eager');
    for (const img of [second, third]) {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).not.toHaveAttribute('fetchpriority');
    }
    for (const img of screen.getAllByRole('img', { hidden: true })) {
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
    }
  });

  it('miniaturas sao ancoras para cada slide (navegacao sem JS) com nome acessivel', () => {
    const { container } = render(<PdpGallery images={images} />);
    const nav = screen.getByRole('navigation', { name: 'Miniaturas' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(3);
    expect(links[1]).toHaveAttribute('href', '#pdp-img-2');
    expect(links[1]).toHaveAccessibleName('Ver foto 2 de 3');
    expect(container.querySelector('#pdp-img-2')).not.toBeNull();
  });

  it('zoom: botao por foto e um dialog nativo por foto com titulo', () => {
    const { container } = render(<PdpGallery images={images} />);
    expect(screen.getByRole('button', { name: 'Ampliar foto 1 de 3' })).toHaveAttribute('aria-haspopup', 'dialog');
    const dialogs = container.querySelectorAll('dialog');
    expect(dialogs).toHaveLength(3);
    expect(dialogs[0]).toHaveAttribute('id', 'pdp-zoom-1');
    expect(dialogs[0]).toHaveAttribute('aria-labelledby');
  });

  it('sem zoom: nenhum botao nem dialog', () => {
    const { container } = render(<PdpGallery images={images} zoom={false} />);
    expect(screen.queryByRole('button', { name: /Ampliar/ })).toBeNull();
    expect(container.querySelector('dialog')).toBeNull();
  });

  it('foto unica nao mostra miniaturas; thumbs=dots usa pontos decorativos', () => {
    const { rerender } = render(<PdpGallery images={images.slice(0, 1)} />);
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(<PdpGallery images={images} thumbs="dots" />);
    const nav = screen.getByRole('navigation', { name: 'Miniaturas' });
    expect(nav.querySelectorAll('img')).toHaveLength(0);
    expect(nav.querySelectorAll('a')).toHaveLength(3);
  });

  it('video: preload none e nome acessivel', () => {
    const { container } = render(<PdpGallery images={images} video="/v.mp4" />);
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('aria-label', 'Vídeo do produto');
  });

  it('schema exige alt e ao menos uma imagem', () => {
    expect(pdpGallerySchema.safeParse({ images: [] }).success).toBe(false);
    expect(pdpGallerySchema.safeParse({ images: [{ src: '/a.jpg', width: 1, height: 1 }] }).success).toBe(false);
    expect(pdpGallerySchema.safeParse({ images }).success).toBe(true);
  });
});
