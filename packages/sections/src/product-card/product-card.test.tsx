import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from './product-card';
import { productCardSchema } from './product-card.schema';

const base = {
  image: { src: '/p.jpg', width: 600, height: 800 },
  name: 'Camiseta basica',
  href: '/camiseta-basica/p',
  price: 79.9,
};

describe('ProductCard', () => {
  it('nome e um link h3 com alvo de 44px; o card NAO e um link unico', () => {
    const { container } = render(<ProductCard {...base} />);
    const link = screen.getByRole('link', { name: 'Camiseta basica' });
    expect(link).toHaveAttribute('href', '/camiseta-basica/p');
    expect(link.className).toContain('min-h-11');
    expect(link.parentElement!.tagName).toBe('H3');
    expect(container.querySelector('article')!.closest('a')).toBeNull();
  });

  it('link da imagem fica fora da ordem de Tab e do leitor de tela, alt vem do nome', () => {
    const { container } = render(<ProductCard {...base} />);
    const imgLink = container.querySelector('a[aria-hidden="true"]')!;
    expect(imgLink).toHaveAttribute('tabindex', '-1');
    expect(imgLink.querySelector('img')).toHaveAttribute('alt', 'Camiseta basica');
  });

  it('imagem tem dimensoes e e lazy por padrao; priority vira eager + fetchpriority alto', () => {
    const { container, rerender } = render(<ProductCard {...base} />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('width', '600');
    expect(img).toHaveAttribute('height', '800');
    expect(img).toHaveAttribute('loading', 'lazy');
    rerender(<ProductCard {...base} priority />);
    const eager = container.querySelector('img')!;
    expect(eager).toHaveAttribute('loading', 'eager');
    expect(eager).toHaveAttribute('fetchpriority', 'high');
  });

  it('reserva a proporcao do token (aspect), sem depender da imagem', () => {
    const { container, rerender } = render(<ProductCard {...base} />);
    expect(container.querySelector<HTMLElement>('a[aria-hidden]')!.style.aspectRatio).toBe('var(--nears-aspect-portrait)');
    rerender(<ProductCard {...base} aspect="square" />);
    expect(container.querySelector<HTMLElement>('a[aria-hidden]')!.style.aspectRatio).toBe('var(--nears-aspect-square)');
  });

  it('preco de/por com desconto', () => {
    render(<ProductCard {...base} listPrice={129.9} installments={{ count: 3 }} />);
    expect(screen.getByText(/129,90/)).toBeInTheDocument();
    expect(screen.getByText(/3x de/)).toBeInTheDocument();
    expect(screen.getByText(/^-\d+%$/)).toBeInTheDocument();
  });

  it('selos em lista', () => {
    render(<ProductCard {...base} badges={[{ label: 'Novo', tone: 'info' }, { label: 'Oferta', tone: 'promo' }]} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByText('Novo')).toBeInTheDocument();
  });

  it('amostras de variacao: nomeadas, no maximo 5 e contador do resto', () => {
    const variantPreview = Array.from({ length: 7 }, (_, i) => ({ label: `Cor ${i + 1}`, color: '#123456' }));
    render(<ProductCard {...base} variantPreview={variantPreview} />);
    const list = screen.getByRole('list', { name: 'Opções disponíveis' });
    expect(within(list).getAllByRole('img')).toHaveLength(5);
    expect(within(list).getByRole('img', { name: 'Cor 1' })).toBeInTheDocument();
    expect(within(list).getByText('+2')).toBeInTheDocument();
  });

  it('variacao sem cor vira texto; sem variacao nao ha lista', () => {
    const { rerender } = render(<ProductCard {...base} variantPreview={[{ label: '220V' }]} />);
    expect(screen.getByText('220V')).toBeInTheDocument();
    rerender(<ProductCard {...base} />);
    expect(screen.queryByRole('list', { name: 'Opções disponíveis' })).toBeNull();
  });

  it('favoritar so existe com endpoint; e um form POST com botao de 44px nomeado pelo produto', () => {
    const { container, rerender } = render(<ProductCard {...base} />);
    expect(container.querySelector('form')).toBeNull();
    rerender(<ProductCard {...base} wishlistAction="/api/favoritos" />);
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('action', '/api/favoritos');
    const button = screen.getByRole('button', { name: 'Favoritar Camiseta basica' });
    expect(button.className).toContain('size-11');
  });

  it('wishlist=false esconde o coracao mesmo com endpoint', () => {
    render(<ProductCard {...base} wishlist={false} wishlistAction="/api/favoritos" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('adicionar rapido exige quickAdd e endpoint', () => {
    const { rerender } = render(<ProductCard {...base} quickAdd />);
    expect(screen.queryByRole('button', { name: 'Adicionar à sacola' })).toBeNull();
    rerender(<ProductCard {...base} quickAddAction="/api/sacola" />);
    expect(screen.queryByRole('button', { name: 'Adicionar à sacola' })).toBeNull();
    rerender(<ProductCard {...base} quickAdd quickAddAction="/api/sacola" />);
    expect(screen.getByRole('button', { name: 'Adicionar à sacola' }).className).toContain('min-h-11');
  });

  it('hover image e decorativa e so aparece com ponteiro fino', () => {
    const { container } = render(<ProductCard {...base} hoverImage={{ src: '/h.jpg', width: 600, height: 800 }} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[1]).toHaveAttribute('alt', '');
    expect(imgs[1]!.className).toContain('hover:hover');
    expect(imgs[1]!.className).toContain('motion-reduce:transition-none');
  });

  it('schema: campos obrigatorios e padroes', () => {
    expect(productCardSchema.safeParse({ ...base, name: '' }).success).toBe(false);
    expect(productCardSchema.safeParse({ ...base, image: { src: '/x.jpg' } }).success).toBe(false);
    expect(productCardSchema.parse(base)).toMatchObject({ quickAdd: false, wishlist: true, aspect: 'portrait', priority: false });
  });
});
