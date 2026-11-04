import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link } from './link';

describe('Link', () => {
  it('renderiza ancora com href', () => {
    render(<Link href="/ofertas">Ofertas</Link>);
    expect(screen.getByRole('link', { name: 'Ofertas' })).toHaveAttribute('href', '/ofertas');
  });

  it('inline fica sublinhado; standalone ganha alvo de 44px', () => {
    const { rerender } = render(<Link href="/a">A</Link>);
    expect(screen.getByRole('link')).toHaveClass('underline');
    rerender(
      <Link href="/a" variant="standalone">
        A
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('min-h-11');
  });

  it('externo abre em nova aba com rel seguro e avisa leitores de tela', () => {
    render(
      <Link href="https://example.com" external>
        Parceiro
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Parceiro, abre em nova aba' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('aceita outro elemento via `as`', () => {
    render(
      <Link as="span" role="link">
        Falso
      </Link>,
    );
    expect(screen.getByText('Falso').tagName).toBe('SPAN');
  });
});
