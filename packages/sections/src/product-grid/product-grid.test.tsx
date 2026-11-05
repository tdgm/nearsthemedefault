import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductGrid } from './product-grid';
import { productGridSchema } from './product-grid.schema';

const product = (n: number) => ({
  image: { src: `/p${n}.jpg`, width: 600, height: 800 },
  name: `Produto ${n}`,
  href: `/produto-${n}/p`,
  price: 50 + n,
});
const products = Array.from({ length: 10 }, (_, i) => product(i + 1));
const filters = [
  { id: 'brand', label: 'Marca', options: [{ value: 'a', label: 'Marca A', count: 3 }, { value: 'b', label: 'Marca B' }] },
  { id: 'color', label: 'Cor', options: [{ value: 'azul', label: 'Azul' }] },
];
const base = { products, total: 100, basePath: '/feminino', facets: ['brand'], filters };

describe('ProductGrid', () => {
  it('h2 so para leitores de tela, cada card e h3, lista real', () => {
    render(<ProductGrid {...base} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Produtos' }).className).toContain('sr-only');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10);
  });

  it('contagem de resultados em role=status, com singular', () => {
    const { rerender } = render(<ProductGrid {...base} />);
    expect(screen.getByRole('status')).toHaveTextContent('100 produtos');
    rerender(<ProductGrid {...base} products={products.slice(0, 1)} total={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('1 produto');
  });

  it('primeira linha (columns.lg) eager com fetchpriority alto; o resto lazy', () => {
    const { container } = render(<ProductGrid {...base} />);
    const imgs = [...container.querySelectorAll('li a[aria-hidden] img')];
    expect(imgs).toHaveLength(10);
    imgs.forEach((img, i) => {
      expect(img.getAttribute('loading'), `card ${i}`).toBe(i < 4 ? 'eager' : 'lazy');
      if (i < 4) expect(img).toHaveAttribute('fetchpriority', 'high');
    });
  });

  it('sizes das imagens reflete as colunas', () => {
    const { container } = render(<ProductGrid {...base} columns={{ xs: 2, md: 3, lg: 5 }} />);
    expect(container.querySelector('img')).toHaveAttribute('sizes', '(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw');
  });

  it('cards depois de duas linhas declaram content-visibility e tamanho intrinseco', () => {
    const { container } = render(<ProductGrid {...base} />);
    const items = container.querySelectorAll('ul > li');
    expect(items[7]!.className).toBe('');
    expect(items[8]!.className).toContain('[content-visibility:auto]');
    expect(items[8]!.className).toContain('contain-intrinsic-size');
  });

  it.each([
    [{ xs: 1, md: 2, lg: 3 }, ['grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3']],
    [{ xs: 2, md: 4, lg: 6 }, ['grid-cols-2', 'md:grid-cols-4', 'lg:grid-cols-6']],
  ])('colunas %j viram classes estaticas', (columns, classes) => {
    const { container } = render(<ProductGrid {...base} columns={columns} />);
    const cls = container.querySelector('ul > li')!.parentElement!.className;
    classes.forEach((c) => expect(cls).toContain(c));
  });

  it('ordenacao: form GET com select (padrao = primeira opcao) e botao', () => {
    const { container } = render(<ProductGrid {...base} query={{ brand: 'a', page: '2' }} />);
    const form = container.querySelector('form[method="get"]')!;
    expect(form).toHaveAttribute('action', '/feminino');
    const select = within(form as HTMLElement).getByRole('combobox', { name: 'Ordenar por' });
    expect(select).toHaveValue('relevance');
    expect(within(form as HTMLElement).getByRole('option', { name: 'Menor preço' })).toHaveValue('price_asc');
    // preserva filtros, descarta a pagina
    expect(form.querySelector('input[type="hidden"][name="brand"]')).toHaveValue('a');
    expect(form.querySelector('input[name="page"]')).toBeNull();
    expect(within(form as HTMLElement).getByRole('button', { name: 'Ordenar' })).toBeInTheDocument();
  });

  it('ordenacao atual vem de currentSort', () => {
    render(<ProductGrid {...base} currentSort="newest" />);
    expect(screen.getByRole('combobox', { name: 'Ordenar por' })).toHaveValue('newest');
  });

  it('filtros: botao abre o drawer; so facetas habilitadas, com marcadas e contagem', () => {
    const { container } = render(<ProductGrid {...base} query={{ brand: ['a'] }} />);
    const trigger = screen.getByRole('button', { name: 'Filtrar' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    const dialog = container.querySelector('dialog#filters') as HTMLElement;
    expect(dialog).toBeInTheDocument();
    const group = within(dialog).getByRole('group', { name: 'Marca', hidden: true });
    expect(within(group).getByRole('checkbox', { name: 'Marca A (3)', hidden: true })).toBeChecked();
    expect(within(group).getByRole('checkbox', { name: 'Marca B', hidden: true })).not.toBeChecked();
    // faceta "color" nao esta em `facets`
    expect(within(dialog).queryByRole('group', { name: 'Cor', hidden: true })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Aplicar filtros', hidden: true })).toBeInTheDocument();
  });

  it('sem facetas habilitadas nao ha botao nem drawer de filtros', () => {
    const { container } = render(<ProductGrid {...base} facets={[]} />);
    expect(screen.queryByRole('button', { name: 'Filtrar' })).toBeNull();
    expect(container.querySelector('dialog')).toBeNull();
  });

  it('paginacao: links indexaveis preservando ordenacao; pagina 1 e a URL limpa', () => {
    render(<ProductGrid {...base} page={2} query={{ sort: 'newest', page: '2' }} />);
    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    expect(within(nav).getByRole('link', { name: 'Página 1' })).toHaveAttribute('href', '/feminino?sort=newest');
    expect(within(nav).getByRole('link', { name: 'Página 3' })).toHaveAttribute('href', '/feminino?page=3&sort=newest');
    expect(within(nav).getByRole('link', { name: 'Próxima página' })).toHaveAttribute('rel', 'next');
  });

  it('uma unica pagina nao mostra paginacao', () => {
    render(<ProductGrid {...base} total={10} />);
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).toBeNull();
  });

  it('estado vazio: mensagem e saida para limpar filtros', () => {
    render(<ProductGrid {...base} products={[]} total={0} query={{ brand: 'a' }} />);
    expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Limpar filtros' }).some((a) => a.getAttribute('href') === '/feminino')).toBe(true);
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });

  it('schema: padroes e limites', () => {
    const parsed = productGridSchema.parse({});
    expect(parsed).toMatchObject({ pageSize: 24, page: 1, total: 0, columns: { xs: 2, md: 3, lg: 4 } });
    expect(parsed.sort).toEqual(['relevance', 'price_asc', 'price_desc', 'newest', 'discount']);
    expect(productGridSchema.safeParse({ columns: { xs: 9 } }).success).toBe(false);
    expect(productGridSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});
