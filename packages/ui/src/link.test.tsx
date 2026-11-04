import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link } from './link';

describe('Link', () => {
  it('renderiza como <a> por padrao', () => {
    render(<Link href="/produto">Ver produto</Link>);
    const link = screen.getByRole('link', { name: 'Ver produto' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/produto');
  });

  it('adiciona rel=noopener noreferrer e aviso de nova aba quando target=_blank', () => {
    render(<Link href="https://example.com" target="_blank">Site externo</Link>);
    const link = screen.getByRole('link', { name: /Site externo/ });
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('aceita `as` para trocar o elemento renderizado (ex.: next/link)', () => {
    function FakeNextLink({ href, children, ...rest }: { href: string; children?: ReactNode }) {
      return <a data-fake-next-link href={href} {...rest}>{children}</a>;
    }
    render(<Link as={FakeNextLink} href="/produto">Produto</Link>);
    expect(screen.getByRole('link', { name: 'Produto' })).toHaveAttribute('data-fake-next-link');
  });
});
