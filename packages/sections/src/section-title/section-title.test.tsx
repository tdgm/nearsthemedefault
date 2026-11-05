import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionTitle } from './section-title';
import { sectionTitleSchema } from './section-title.schema';

describe('SectionTitle', () => {
  it('renderiza h2 por padrao', () => {
    render(<SectionTitle text="Novidades" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Novidades' })).toBeInTheDocument();
  });

  it('respeita level h1 (titulo da pagina)', () => {
    render(<SectionTitle text="Camisetas" level="h1" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Camisetas' })).toBeInTheDocument();
  });

  it('respeita level h3', () => {
    render(<SectionTitle text="Novidades" level="h3" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('com href o titulo e um link com alvo de 44px', () => {
    render(<SectionTitle text="Novidades" href="/novidades" />);
    const link = screen.getByRole('link', { name: 'Novidades' });
    expect(link).toHaveAttribute('href', '/novidades');
    expect(link.className).toContain('min-h-11');
  });

  it('schema: texto obrigatorio, level so h1/h2/h3 e padrao h2', () => {
    expect(sectionTitleSchema.safeParse({ text: '' }).success).toBe(false);
    expect(sectionTitleSchema.safeParse({ text: 'x', level: 'h4' }).success).toBe(false);
    expect(sectionTitleSchema.parse({ text: 'x' }).level).toBe('h2');
  });
});
