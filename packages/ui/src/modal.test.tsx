import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  it('nao renderiza o dialog quando open=false', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Guia de medidas">
        Conteúdo
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza o dialog com o titulo quando open=true', () => {
    render(
      <Modal open onOpenChange={() => {}} title="Guia de medidas">
        Conteúdo do guia
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Guia de medidas' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do guia')).toBeInTheDocument();
  });
});
