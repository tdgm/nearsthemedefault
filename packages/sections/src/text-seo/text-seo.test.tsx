import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextSeo } from './text-seo';
import { textSeoSchema } from './text-seo.schema';

const richText = 'Resposta direta.\n\nDetalhe um.\n\nDetalhe dois.';

describe('TextSeo', () => {
  it('titulo e h2; o primeiro paragrafo fica fora do details (sempre visivel)', () => {
    const { container } = render(<TextSeo title="O que e?" richText={richText} />);
    expect(screen.getByRole('heading', { level: 2, name: 'O que e?' })).toBeInTheDocument();
    const lead = screen.getByText('Resposta direta.');
    expect(lead.closest('details')).toBeNull();
    expect(container.querySelectorAll('details')).toHaveLength(1);
  });

  it('todo o conteudo esta no DOM mesmo recolhido', () => {
    const { container } = render(<TextSeo richText={richText} />);
    const details = container.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    expect(details).toHaveTextContent('Detalhe um.');
    expect(details).toHaveTextContent('Detalhe dois.');
  });

  it('o controle de expandir e o summary nativo, com alvo de 44px e rotulos', () => {
    const { container } = render(<TextSeo richText={richText} labels={{ more: 'Mais', less: 'Menos' }} />);
    const summary = container.querySelector('summary')!;
    expect(summary.className).toContain('min-h-11');
    expect(summary).toHaveTextContent('Mais');
    expect(summary).toHaveTextContent('Menos');
  });

  it('collapsedHeight vira a variavel CSS do trecho recolhido', () => {
    const { container } = render(<TextSeo richText={richText} collapsedHeight={200} />);
    expect(container.querySelector('details')!.style.getPropertyValue('--nears-collapsed')).toBe('200px');
  });

  it('collapsible=false renderiza tudo sem details', () => {
    const { container } = render(<TextSeo richText={richText} collapsible={false} />);
    expect(container.querySelector('details')).toBeNull();
    expect(screen.getByText('Detalhe dois.')).toBeInTheDocument();
  });

  it('um unico paragrafo nao gera controle', () => {
    const { container } = render(<TextSeo richText="So um." />);
    expect(container.querySelector('details')).toBeNull();
  });

  it('declara content-visibility auto e tamanho intrinseco', () => {
    const { container } = render(<TextSeo richText={richText} />);
    const cls = container.querySelector('section')!.className;
    expect(cls).toContain('[content-visibility:auto]');
    expect(cls).toContain('contain-intrinsic-size');
  });

  it('schema: richText obrigatorio e padroes aplicados', () => {
    expect(textSeoSchema.safeParse({ richText: '' }).success).toBe(false);
    expect(textSeoSchema.parse({ richText: 'x' })).toMatchObject({ collapsible: true, collapsedHeight: 160 });
  });
});
