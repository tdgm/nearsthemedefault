import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FoundationsNote } from './foundations-note';

describe('FoundationsNote', () => {
  it('expoe o titulo como heading ligado a secao', () => {
    render(<FoundationsNote title="Titulo">Corpo</FoundationsNote>);
    const section = screen.getByRole('region', { name: 'Titulo' });
    expect(section).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Titulo' })).toBeInTheDocument();
  });

  it('renderiza o conteudo', () => {
    render(<FoundationsNote title="T">Corpo do aviso</FoundationsNote>);
    expect(screen.getByText('Corpo do aviso')).toBeInTheDocument();
  });
});
