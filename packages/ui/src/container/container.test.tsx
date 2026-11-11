import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container, containerClasses } from './container';

describe('Container', () => {
  it('renderiza um div por padrao com as classes de container', () => {
    const { container } = render(<Container data-testid="c">conteudo</Container>);
    const el = container.querySelector('[data-testid="c"]');
    expect(el?.tagName).toBe('DIV');
    for (const cls of containerClasses.split(' ')) expect(el).toHaveClass(cls);
  });

  it('troca o elemento via `as` mantendo as classes', () => {
    render(
      <Container as="section" aria-label="area">
        conteudo
      </Container>,
    );
    const el = screen.getByRole('region', { name: 'area' });
    expect(el.tagName).toBe('SECTION');
    for (const cls of containerClasses.split(' ')) expect(el).toHaveClass(cls);
  });

  it('mescla className extra sem perder as classes do container', () => {
    const { container } = render(<Container data-testid="c" className="mb-20" />);
    const el = container.querySelector('[data-testid="c"]');
    expect(el).toHaveClass('mb-20');
    for (const cls of containerClasses.split(' ')) expect(el).toHaveClass(cls);
  });
});
