import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza o texto', () => {
    render(<Badge>-20%</Badge>);
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('promo usa os tokens do par badge-promo', () => {
    render(<Badge tone="promo">Oferta</Badge>);
    expect(screen.getByText('Oferta')).toHaveClass('bg-badge-promo-bg', 'text-badge-promo-on');
  });

  it.each(['success', 'warning', 'danger', 'info'] as const)('tom %s usa a cor semantica correspondente', (tone) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    expect(screen.getByText(tone)).toHaveClass(`text-${tone}`);
  });
});
