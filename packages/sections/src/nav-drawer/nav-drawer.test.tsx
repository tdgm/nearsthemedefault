import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavDrawer } from './nav-drawer';
import { navDrawerSchema } from './nav-drawer.schema';

const departments = [
  {
    label: 'Feminino',
    href: '/feminino',
    highlight: { label: 'Novidades', href: '/feminino/novidades' },
    groups: [{ label: 'Roupas', href: '/feminino/roupas', links: [{ label: 'Camisetas', href: '/feminino/roupas/camisetas' }] }],
    promo: { title: 'Coleção de verão', href: '/colecao-verao' },
  },
  { label: 'Ofertas', href: '/ofertas' },
];

// O <dialog> fechado sai da arvore de acessibilidade: as queries usam `hidden: true`
// (o conteudo existe no DOM/HTML inicial, so nao e anunciado ate abrir).
describe('NavDrawer', () => {
  it('e um dialog nomeado com id nav-drawer, fechado, com landmark navigation', () => {
    const { container } = render(<NavDrawer departments={departments} />);
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('id', 'nav-drawer');
    expect(dialog).not.toHaveAttribute('open');
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'Departamentos');
  });

  it('todos os links (inclusive de niveis fechados) estao no HTML inicial', () => {
    const { container } = render(<NavDrawer departments={departments} />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/feminino', '/feminino/novidades', '/feminino/roupas', '/feminino/roupas/camisetas', '/colecao-verao', '/ofertas']),
    );
  });

  it('departamento com filhos usa details/summary; sem filhos e link direto', () => {
    const { container } = render(<NavDrawer departments={departments} />);
    expect(container.querySelectorAll('details')).toHaveLength(1);
    expect(within(container.querySelector('details')!).getByText('Feminino')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ofertas', hidden: true })).toHaveClass('min-h-11');
  });

  it('inclui "Ver tudo" do departamento e todos os alvos de toque tem 44px', () => {
    const { container } = render(<NavDrawer departments={departments} />);
    expect(screen.getByRole('link', { name: 'Ver tudo em Feminino', hidden: true })).toHaveAttribute('href', '/feminino');
    container.querySelectorAll('nav a').forEach((a) => expect(a).toHaveClass('min-h-11'));
  });

  it('labels sobrescrevem a microcopy', () => {
    render(<NavDrawer departments={departments} labels={{ title: 'Categorias' }} />);
    expect(screen.getByRole('heading', { name: 'Categorias', hidden: true })).toBeInTheDocument();
  });
});

describe('navDrawerSchema', () => {
  it('valida departamentos e rejeita link sem href', () => {
    expect(navDrawerSchema.safeParse({ departments }).success).toBe(true);
    expect(navDrawerSchema.safeParse({ departments: [{ label: 'x' }] }).success).toBe(false);
  });
});
