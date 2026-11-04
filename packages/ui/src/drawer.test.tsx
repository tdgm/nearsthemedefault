import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Drawer } from './drawer';

describe('Drawer', () => {
  it('renderiza o dialog com o titulo quando open=true', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Sua sacola">
        Vazia
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Sua sacola' })).toBeInTheDocument();
  });

  it('nao renderiza quando open=false', () => {
    render(
      <Drawer open={false} onOpenChange={() => {}} title="Sua sacola">
        Vazia
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
