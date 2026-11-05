import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpDetails } from './pdp-details';
import { pdpDetailsSchema } from './pdp-details.schema';

const full = {
  description: 'Primeiro paragrafo.\n\nSegundo.',
  specs: [{ name: 'Marca', value: 'Marca 1' }, { name: 'Garantia', value: '12 meses' }],
  instructions: 'Lave a mao.',
  guide: { columns: ['Tamanho', 'Peito'], rows: [['P', '92'], ['M', '98']] },
};

describe('PdpDetails', () => {
  it('h2 da secao e h3 por item; tudo no DOM (details), so a descricao aberta', () => {
    const { container } = render(<PdpDetails {...full} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Detalhes do produto' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    const details = container.querySelectorAll('details');
    expect([...details].map((d) => d.open)).toEqual([true, false, false, false]);
    expect(screen.getByText('Lave a mao.')).toBeInTheDocument();
  });

  it('especificacoes e guia sao tabelas semanticas com scope', () => {
    render(<PdpDetails {...full} />);
    const tables = screen.getAllByRole('table', { hidden: true });
    expect(tables).toHaveLength(2);
    const specs = tables[0]!;
    expect(within(specs).getAllByRole('rowheader', { hidden: true }).map((h) => h.textContent)).toEqual(['Marca', 'Garantia']);
    const guide = tables[1]!;
    expect(within(guide).getAllByRole('columnheader', { hidden: true }).map((h) => h.textContent)).toEqual(['Tamanho', 'Peito']);
    expect(within(guide).getAllByRole('rowheader', { hidden: true }).map((h) => h.textContent)).toEqual(['P', 'M']);
  });

  it('itens tem id de ancora (#guia) e a descricao vira paragrafos', () => {
    const { container } = render(<PdpDetails {...full} />);
    expect(container.querySelector('details#guia')).not.toBeNull();
    expect(screen.getByText('Primeiro paragrafo.').tagName).toBe('P');
  });

  it('omite itens sem conteudo e some quando nao ha nada', () => {
    const { container, rerender } = render(<PdpDetails description="Texto." />);
    expect(container.querySelectorAll('details')).toHaveLength(1);
    rerender(<PdpDetails />);
    expect(container.firstChild).toBeNull();
  });

  it('schema: specs default [] e guia exige colunas e linhas', () => {
    expect(pdpDetailsSchema.parse({}).specs).toEqual([]);
    expect(pdpDetailsSchema.safeParse({ guide: { columns: [], rows: [['a']] } }).success).toBe(false);
  });
});
