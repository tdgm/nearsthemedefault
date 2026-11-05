import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Showcase } from './showcase';
import { showcaseSchema } from './showcase.schema';

const product = (n: number) => ({
  image: { src: `/p${n}.jpg`, width: 600, height: 800 },
  name: `Produto ${n}`,
  href: `/produto-${n}/p`,
  price: 50 + n,
});
const products = Array.from({ length: 12 }, (_, i) => product(i + 1));

describe('Showcase', () => {
  it('titulo h2, cards h3 e limit corta a lista', () => {
    render(<Showcase title="Destaques da semana" products={products} limit={6} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Destaques da semana' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  });

  it('padrao: 8 cards; todas as imagens lazy (secao abaixo da dobra)', () => {
    const { container } = render(<Showcase products={products} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(8);
    container.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('loading', 'lazy'));
  });

  it.each([
    ['static', 'Destaques'],
    ['personalized', 'Escolhidos para você'],
    ['recommended', 'Você também pode gostar'],
    ['wishlist', 'Seus favoritos'],
  ] as const)('variante %s tem titulo padrao', (variant, title) => {
    render(<Showcase variant={variant} products={products} />);
    expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
  });

  it('titulos podem vir do vocabulario (labels.titles)', () => {
    render(<Showcase variant="recommended" products={products} labels={{ titles: { recommended: 'Combina com isso' } }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Combina com isso' })).toBeInTheDocument();
  });

  it('sem produtos, as variantes somem; favoritos explica o vazio', () => {
    const { container, rerender } = render(<Showcase variant="recommended" products={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Showcase variant="wishlist" products={[]} />);
    expect(screen.getByText('Você ainda não favoritou nenhum produto.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });

  it('faixa com scroll-snap nativo e cards de largura fixa no mobile', () => {
    const { container } = render(<Showcase products={products} />);
    expect(container.querySelector('ul')!.className).toContain('snap-x');
    expect(container.querySelector('ul > li')!.className).toContain('snap-start');
  });

  it('declara content-visibility auto e tamanho intrinseco', () => {
    const { container } = render(<Showcase products={products} />);
    const cls = container.querySelector('section')!.className;
    expect(cls).toContain('[content-visibility:auto]');
    expect(cls).toContain('contain-intrinsic-size');
  });

  describe('abas', () => {
    const tabs = [
      { label: 'Mais vendidos', products: products.slice(0, 4) },
      { id: 'novos', label: 'Lançamentos', products: products.slice(4, 8) },
    ];

    it('tablist nomeado, aba 1 selecionada e todos os paineis no HTML (inativos hidden)', () => {
      render(<Showcase variant="tabs" title="Vitrine" tabs={tabs} />);
      expect(screen.getByRole('tablist', { name: 'Vitrine' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Mais vendidos' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Lançamentos' })).toHaveAttribute('aria-selected', 'false');
      // 8 cards no DOM (4 por aba), so os da aba ativa acessiveis
      expect(screen.getAllByRole('heading', { level: 3, hidden: true })).toHaveLength(8);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    });

    it('trocar de aba mostra os produtos dela', () => {
      render(<Showcase variant="tabs" tabs={tabs} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Lançamentos' }));
      const panel = screen.getByRole('tabpanel');
      expect(within(panel).getByRole('link', { name: 'Produto 5' })).toBeInTheDocument();
    });

    it('limit vale por aba', () => {
      render(<Showcase variant="tabs" tabs={[{ label: 'A', products }]} limit={4} />);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    });

    it('variante tabs sem abas cai para a lista simples', () => {
      render(<Showcase variant="tabs" products={products.slice(0, 4)} />);
      expect(screen.queryByRole('tablist')).toBeNull();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    });
  });

  it('schema: limit entre 4 e 12 (padrao 8), variante validada', () => {
    expect(showcaseSchema.safeParse({ limit: 3 }).success).toBe(false);
    expect(showcaseSchema.safeParse({ limit: 13 }).success).toBe(false);
    expect(showcaseSchema.safeParse({ variant: 'outra' }).success).toBe(false);
    expect(showcaseSchema.parse({})).toMatchObject({ variant: 'static', limit: 8, products: [] });
  });
});
