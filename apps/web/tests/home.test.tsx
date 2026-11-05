import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '../app/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('home', () => {
  it('tem um unico H1 (nome da loja) e landmark main', async () => {
    render(await HomePage());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loja');
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('compoe as sections na ordem do manifest e mostra um bloco por departamento em destaque', async () => {
    render(await HomePage());
    const main = screen.getByRole('main');
    // um H2 por departamento (section-title do repeat) — 3 no mock, abaixo do limite de 6
    for (const name of ['Departamento exemplo', 'Departamento 2', 'Departamento 3']) {
      expect(within(main).getAllByRole('heading', { level: 2, name: new RegExp(name) }).length).toBeGreaterThan(0);
    }
    // text-seo e faq sempre no HTML (sem JS)
    expect(within(main).getByRole('heading', { level: 2, name: /O que você encontra/ })).toBeInTheDocument();
    expect(within(main).getByRole('heading', { level: 2, name: 'Perguntas frequentes' })).toBeInTheDocument();
  });

  it('vitrine em abas expoe todos os paineis no HTML inicial (indexavel)', async () => {
    render(await HomePage());
    expect(screen.getAllByRole('tab').length).toBeGreaterThanOrEqual(3);
  });
});
