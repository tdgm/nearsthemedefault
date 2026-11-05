import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './hero';
import { heroSchema } from './hero.schema';

const slide = (n: number, extra = {}) => ({
  imageDesktop: { src: `/d${n}.jpg`, width: 1440, height: 560 },
  imageMobile: { src: `/m${n}.jpg`, width: 720, height: 900 },
  alt: `Campanha ${n}`,
  href: `/campanha/${n}`,
  ...extra,
});
const slides = [slide(1, { headline: 'Inverno', cta: 'Ver colecao' }), slide(2), slide(3)];

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
});

describe('Hero', () => {
  it('so o primeiro slide e eager com fetchpriority alto; os demais lazy', () => {
    render(<Hero slides={slides} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute('loading', 'eager');
    expect(imgs[0]).toHaveAttribute('fetchpriority', 'high');
    expect(imgs[1]).toHaveAttribute('loading', 'lazy');
    expect(imgs[1]).not.toHaveAttribute('fetchpriority');
    expect(imgs[2]).toHaveAttribute('decoding', 'async');
  });

  it('picture com art direction e dimensoes nos dois formatos', () => {
    const { container } = render(<Hero slides={slides} />);
    const source = container.querySelector('source')!;
    expect(source).toHaveAttribute('media', '(min-width: 768px)');
    expect(source).toHaveAttribute('width', '1440');
    expect(source).toHaveAttribute('height', '560');
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('width', '720');
    expect(img).toHaveAttribute('height', '900');
  });

  it('todos os slides estao no HTML, em carrossel nomeado com "n de total"', () => {
    render(<Hero slides={slides} />);
    const region = screen.getByRole('region', { name: 'Destaques' });
    expect(region).toHaveAttribute('aria-roledescription', 'carrossel');
    expect(within(region).getByRole('group', { name: '3 de 3' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Campanha 2' })).toHaveLength(1);
  });

  it('legenda: headline e botao so quando existem; headline nao e heading', () => {
    render(<Hero slides={slides} />);
    expect(screen.getByText('Inverno').tagName).toBe('P');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByRole('link', { name: 'Ver colecao' })).toHaveAttribute('href', '/campanha/1');
  });

  it('sem autoplay nao ha botao de pausa; com autoplay ha', () => {
    const { rerender } = render(<Hero slides={slides} />);
    expect(screen.queryByRole('button', { name: /Pausar|Retomar/ })).toBeNull();
    rerender(<Hero slides={slides} autoplay />);
    expect(screen.getByRole('button', { name: 'Pausar rotação' })).toBeInTheDocument();
  });

  it('slide unico: sem carrossel nem botoes, mantem LCP eager', () => {
    render(<Hero slides={slides.slice(0, 1)} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByRole('region', { name: 'Destaques' })).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
  });

  it('nome da regiao customizavel', () => {
    render(<Hero slides={slides} labels={{ region: 'Campanhas' }} />);
    expect(screen.getByRole('region', { name: 'Campanhas' })).toBeInTheDocument();
  });

  it('schema: >= 1 slide, alt obrigatorio, intervalo >= 3s, autoplay desligado por padrao', () => {
    expect(heroSchema.safeParse({ slides: [] }).success).toBe(false);
    expect(heroSchema.safeParse({ slides: [slide(1, { alt: '' })] }).success).toBe(false);
    expect(heroSchema.safeParse({ slides, intervalMs: 1000 }).success).toBe(false);
    expect(heroSchema.parse({ slides })).toMatchObject({ autoplay: false, intervalMs: 6000 });
  });
});
