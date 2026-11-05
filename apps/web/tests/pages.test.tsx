import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstitutionalPage } from '../lib/templates/institutional';
import { NotFoundPage } from '../lib/templates/not-found';
import { SitemapPage } from '../lib/templates/sitemap';
import { resolveSegments } from '../lib/routing/resolve';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('mapa do site', () => {
  it('um H1 e links para todo departamento, categoria, subcategoria, tipo, campanha e pagina', async () => {
    render(await SitemapPage());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    for (const h of [
      '/departamento-exemplo',
      '/departamento-exemplo/categoria-exemplo',
      '/departamento-exemplo/categoria-exemplo/sub-exemplo',
      '/tipo-exemplo',
      '/campanha-exemplo',
      '/campanha-exemplo/segmento-exemplo',
      '/pagina-exemplo',
    ]) {
      expect(hrefs).toContain(h);
    }
  });
});

describe('404', () => {
  it('um H1 e vitrine de recomendados', async () => {
    render(await NotFoundPage());
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getAllByRole('link', { name: /Produto/ }).length).toBeGreaterThan(0);
  });
});

describe('pagina institucional', () => {
  it('H1 do CMS e corpo em paragrafos', async () => {
    const resolved = await resolveSegments(['pagina-exemplo']);
    if (resolved?.kind !== 'page') throw new Error('esperava page');
    render(await InstitutionalPage({ resolved }));
    expect(screen.getByRole('heading', { level: 1, name: 'Página exemplo' })).toBeInTheDocument();
    expect(screen.getByText(/exemplo de conteúdo vindo do CMS/)).toBeInTheDocument();
  });
});
