import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BannerFull } from './banner-full';
import { bannerFullSchema } from './banner-full.schema';

const props = {
  image: { src: '/i.jpg', width: 960, height: 720 },
  alt: 'Pessoa de camiseta',
  headline: 'Conforto o dia todo',
  body: 'Malha leve.',
  cta: 'Ver colecao',
  href: '/colecao',
};

describe('BannerFull', () => {
  it('titulo h2, corpo e botao como link', () => {
    render(<BannerFull {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Conforto o dia todo' })).toBeInTheDocument();
    expect(screen.getByText('Malha leve.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver colecao' })).toHaveAttribute('href', '/colecao');
  });

  it('imagem lazy com dimensoes e alt', () => {
    render(<BannerFull {...props} />);
    const img = screen.getByAltText('Pessoa de camiseta');
    expect(img).toHaveAttribute('width', '960');
    expect(img).toHaveAttribute('height', '720');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('texto nao fica sobre a imagem (sem posicionamento absoluto no painel)', () => {
    const { container } = render(<BannerFull {...props} />);
    expect(container.querySelector('h2')!.parentElement!.className).not.toMatch(/absolute/);
  });

  it('sem cta ou sem href nao renderiza botao', () => {
    const { rerender } = render(<BannerFull {...props} href={undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<BannerFull {...props} cta={undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('imageSide=right inverte a ordem no desktop', () => {
    render(<BannerFull {...props} imageSide="right" />);
    expect(screen.getByAltText('Pessoa de camiseta').className).toContain('md:order-2');
  });

  it('schema: headline obrigatoria e imageSide padrao left', () => {
    expect(bannerFullSchema.safeParse({ ...props, headline: '' }).success).toBe(false);
    expect(bannerFullSchema.parse(props).imageSide).toBe('left');
  });
});
