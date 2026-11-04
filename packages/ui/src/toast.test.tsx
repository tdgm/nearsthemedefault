import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from './toast';

describe('Toast', () => {
  it('anuncia via role=status + aria-live=polite', () => {
    render(
      <Toast open onClose={() => {}}>
        Produto adicionado
      </Toast>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Produto adicionado');
  });

  it('nao renderiza nada quando open=false', () => {
    const { container } = render(
      <Toast open={false} onClose={() => {}}>
        Oculto
      </Toast>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('fecha ao clicar no X', () => {
    const onClose = vi.fn();
    render(
      <Toast open onClose={onClose}>
        Mensagem
      </Toast>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fecha sozinho apos `duration`', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <Toast open onClose={onClose} duration={3000}>
        Some sozinho
      </Toast>,
    );
    vi.advanceTimersByTime(3000);
    expect(onClose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
