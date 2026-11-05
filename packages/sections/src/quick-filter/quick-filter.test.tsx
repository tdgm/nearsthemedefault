import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuickFilter } from './quick-filter';
import { quickFilterSchema } from './quick-filter.schema';

const chips = [
  { label: 'Azul', facet: 'cor', value: 'azul' },
  { label: 'Tamanho M', facet: 'tamanho', value: 'M' },
];

describe('QuickFilter', () => {
  it('nav nomeado com lista de links reais e href por faceta', () => {
    render(<QuickFilter chips={chips} basePath="/feminino" />);
    expect(screen.getByRole('navigation', { name: 'Filtros rápidos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Azul' })).toHaveAttribute('href', '/feminino?cor=azul');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('chip ativo tem aria-current e vira toggle (remove o filtro)', () => {
    render(<QuickFilter chips={chips} basePath="/feminino" current={{ cor: 'azul' }} />);
    const active = screen.getByRole('link', { name: 'Azul' });
    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveAttribute('href', '/feminino');
    expect(screen.getByRole('link', { name: 'Tamanho M' })).not.toHaveAttribute('aria-current');
  });

  it('combinar facetas gera rel=nofollow; chip simples nao', () => {
    render(<QuickFilter chips={chips} basePath="/feminino" current={{ cor: 'azul' }} />);
    expect(screen.getByRole('link', { name: 'Tamanho M' })).toHaveAttribute('rel', 'nofollow');
    expect(screen.getByRole('link', { name: 'Azul' })).not.toHaveAttribute('rel');
  });

  it('alvo de 44px e altura reservada de 48px; faixa focavel', () => {
    render(<QuickFilter chips={chips} />);
    screen.getAllByRole('link').forEach((a) => expect(a.className).toContain('min-h-11'));
    expect(screen.getByRole('navigation').className).toContain('min-h-12');
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0');
  });

  it('schema: ao menos um chip; padroes basePath vazio e current vazio', () => {
    expect(quickFilterSchema.safeParse({ chips: [] }).success).toBe(false);
    expect(quickFilterSchema.parse({ chips })).toMatchObject({ basePath: '', current: {} });
  });
});
