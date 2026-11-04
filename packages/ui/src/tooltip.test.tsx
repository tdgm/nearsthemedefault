import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('liga o gatilho ao conteudo via aria-describedby', () => {
    render(
      <Tooltip content="Informação extra">
        <button type="button">Ajuda</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Ajuda' });
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByRole('tooltip')).toHaveAttribute('id', describedBy);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Informação extra');
  });
});
