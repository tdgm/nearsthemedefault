import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Modal } from './modal';

// jsdom nao implementa showModal/close do <dialog>.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

describe('Modal', () => {
  it('abre com showModal quando open=true e expoe nome acessivel', () => {
    render(<Modal open onClose={() => {}} title="Sacola">conteudo</Modal>);
    expect(screen.getByRole('dialog', { name: 'Sacola' })).toBeInTheDocument();
  });

  it('fica fechado quando open=false', () => {
    const { container } = render(<Modal open={false} onClose={() => {}} title="Sacola">x</Modal>);
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('botao Fechar chama onClose e tem 44px', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sacola">x</Modal>);
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(close).toHaveClass('size-11');
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalled();
  });

  it('clique no backdrop fecha; clique no conteudo nao', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sacola"><p>dentro</p></Modal>);
    fireEvent.click(screen.getByText('dentro'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Esc (evento close do dialog) chama onClose', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sacola">x</Modal>);
    fireEvent(screen.getByRole('dialog'), new Event('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('variante drawer ancora na lateral', () => {
    render(<Modal open onClose={() => {}} title="Filtros" variant="drawer" side="left">x</Modal>);
    expect(screen.getByRole('dialog')).toHaveClass('mr-auto', 'h-dvh');
  });
});
