import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza o conteudo', () => {
    render(<Badge>-20%</Badge>);
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });
});
