import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('renderiza role=tooltip com o texto', () => {
    render(
      <Tooltip id="t1" content="Guia de medidas">
        <button aria-describedby="t1">?</button>
      </Tooltip>,
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Guia de medidas');
  });

  it('o gatilho e descrito pelo tooltip', () => {
    render(
      <Tooltip id="t1" content="Guia de medidas">
        <button aria-describedby="t1">Ajuda</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Ajuda' })).toHaveAccessibleDescription('Guia de medidas');
  });

  it('aparece no hover e no foco', () => {
    render(
      <Tooltip id="t1" content="x">
        <button aria-describedby="t1">?</button>
      </Tooltip>,
    );
    expect(screen.getByRole('tooltip')).toHaveClass('group-hover:opacity-100', 'group-focus-within:opacity-100');
  });

  it('nao captura o ponteiro (nao bloqueia cliques)', () => {
    render(<Tooltip id="t1" content="x"><button>?</button></Tooltip>);
    expect(screen.getByRole('tooltip')).toHaveClass('pointer-events-none');
  });
});
