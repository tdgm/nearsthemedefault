import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header, SkipLink } from './header';
import { headerSchema } from './header.schema';

const logo = { src: '/logo.svg', width: 120, height: 32, alt: 'Loja' };
const nav = { departments: [{ label: 'Feminino', href: '/feminino' }] };

describe('Header', () => {
  it('landmark banner com altura reservada de 56px', () => {
    render(<Header logo={logo} nav={nav} />);
    expect(screen.getByRole('banner')).toHaveClass('h-14', 'sticky');
  });

  it('skip link e o primeiro item focavel e aponta para #conteudo', () => {
    render(<Header logo={logo} nav={nav} />);
    const skip = screen.getAllByRole('link')[0];
    expect(skip).toHaveTextContent('Ir para o conteúdo');
    expect(skip).toHaveAttribute('href', '#conteudo');
  });

  it('skipLink={false} tira o skip link do header (o layout o renderiza antes da PromoBar)', () => {
    render(<Header logo={logo} nav={nav} skipLink={false} />);
    expect(screen.queryByRole('link', { name: 'Ir para o conteúdo' })).toBeNull();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    render(<Header logo={logo} nav={nav} variant="none" skipLink={false} />);
    expect(screen.queryByRole('link', { name: 'Ir para o conteúdo' })).toBeNull();
  });

  it('SkipLink isolado: rotulo e destino configuraveis', () => {
    render(<SkipLink label="Saltar" href="#principal" />);
    expect(screen.getByRole('link', { name: 'Saltar' })).toHaveAttribute('href', '#principal');
  });

  it('logo a esquerda, link para a home, com dimensoes e prioridade (LCP)', () => {
    render(<Header logo={logo} nav={nav} homeHref="/inicio" />);
    const img = screen.getByAltText('Loja');
    expect(img).toHaveAttribute('width', '120');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img.closest('a')).toHaveAttribute('href', '/inicio');
  });

  it('hamburger abre o nav-drawer e tem 44px', () => {
    render(<Header logo={logo} nav={nav} />);
    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-controls', 'nav-drawer');
    expect(menu).toHaveClass('size-11');
  });

  it('sem departamentos nao mostra o hamburger', () => {
    render(<Header logo={logo} nav={{ departments: [] }} />);
    expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull();
  });

  it('departamento sem grupos/destaque/promo vira link direto no nav inline', () => {
    render(<Header logo={logo} nav={nav} />);
    expect(screen.getByRole('link', { name: 'Feminino' })).toHaveAttribute('href', '/feminino');
  });

  it('departamento com grupos vira mega-menu inline (details/summary nativo, fechado por padrao, sem JS)', () => {
    const navWithGroups = {
      departments: [
        {
          label: 'Masculino',
          href: '/masculino',
          groups: [{ label: 'Camisetas', links: [{ label: 'Manga curta', href: '/masculino/camisetas/manga-curta' }] }],
        },
      ],
    };
    const { container } = render(<Header logo={logo} nav={navWithGroups} />);
    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByRole('link', { name: 'Ver tudo em Masculino', hidden: true })).toHaveAttribute('href', '/masculino');
    // Mesmo fechado, o link ja esta no HTML inicial (indexavel, sem precisar de JS pra abrir).
    expect(Array.from(details!.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toContain('/masculino/camisetas/manga-curta');
  });

  it('busca: form GET para /s com input q e label', () => {
    render(<Header logo={logo} nav={nav} />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('action', '/s');
    expect(form).toHaveAttribute('method', 'get');
    expect(within(form).getByLabelText('O que você procura?')).toHaveAttribute('name', 'q');
  });

  it('badges entram no nome acessivel (texto visivel contido no nome)', () => {
    render(<Header logo={logo} nav={nav} cartCount={3} wishlistCount={1} />);
    expect(screen.getByRole('button', { name: 'Carrinho, 3 itens' })).toHaveAttribute('aria-controls', 'minicart');
    expect(screen.getByRole('link', { name: 'Favoritos, 1 item' })).toHaveAttribute('href', '/account/favoritos');
  });

  it('contador acima de 99 vira 99+', () => {
    render(<Header logo={logo} nav={nav} cartCount={150} />);
    expect(screen.getByRole('button', { name: 'Carrinho, 99+ itens' })).toBeInTheDocument();
  });

  it('variante minimal: so logo e carrinho', () => {
    render(<Header logo={logo} nav={nav} variant="minimal" />);
    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Minha conta' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Carrinho' })).toBeInTheDocument();
  });

  it('variante none: nao renderiza o header, so o skip link', () => {
    render(<Header logo={logo} nav={nav} variant="none" />);
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toBeInTheDocument();
  });

  it('flags desligam conta, favoritos e carrinho', () => {
    render(<Header logo={logo} nav={nav} account={false} wishlist={false} cart={false} />);
    expect(screen.queryByRole('link', { name: 'Minha conta' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Favoritos' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Carrinho' })).toBeNull();
  });

  it('labels sobrescrevem a microcopy (vocabulary do nicho)', () => {
    render(<Header logo={logo} nav={nav} labels={{ cart: 'Sacola' }} />);
    expect(screen.getByRole('button', { name: 'Sacola' })).toBeInTheDocument();
  });

  it('cartTrigger substitui o botao interno (ilha dinamica do app layer, Fase 10/ADR 0029)', () => {
    render(<Header logo={logo} nav={nav} cartCount={5} cartTrigger={<button type="button">Carrinho sob medida</button>} />);
    expect(screen.getByRole('button', { name: 'Carrinho sob medida' })).toBeInTheDocument();
    // Com override, o botao interno (que usaria `cartCount`) nao e renderizado.
    expect(screen.queryByRole('button', { name: 'Carrinho, 5 itens' })).toBeNull();
  });

  it('cartTrigger so aparece quando cart={true} (mesma flag do botao interno)', () => {
    render(<Header logo={logo} nav={nav} cart={false} cartTrigger={<button type="button">Carrinho sob medida</button>} />);
    expect(screen.queryByRole('button', { name: 'Carrinho sob medida' })).toBeNull();
  });
});

describe('headerSchema', () => {
  it('exige logo com alt', () => {
    expect(headerSchema.safeParse({ logo }).success).toBe(true);
    expect(headerSchema.safeParse({ logo: { ...logo, alt: '' } }).success).toBe(false);
    expect(headerSchema.safeParse({}).success).toBe(false);
  });
  it('variant so aceita full|minimal|none', () => {
    expect(headerSchema.safeParse({ logo, variant: 'compact' }).success).toBe(false);
  });
});
