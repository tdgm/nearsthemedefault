import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './toast';

function Trigger({ tone }: { tone?: 'info' | 'success' | 'danger' }) {
  const { show } = useToast();
  return <button onClick={() => show('Adicionado à sacola', tone)}>Adicionar</button>;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('a regiao aria-live polite existe antes de qualquer mensagem', () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('anuncia a mensagem dentro da regiao live', () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('Adicionar'));
    expect(screen.getByRole('status')).toHaveTextContent('Adicionado à sacola');
  });

  it('fecha sozinho apos a duracao', () => {
    render(<ToastProvider duration={1000}><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('Adicionar'));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('botao dispensa o aviso e tem 44px', () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('Adicionar'));
    const dismiss = screen.getByRole('button', { name: 'Dispensar aviso' });
    expect(dismiss).toHaveClass('size-11');
    fireEvent.click(dismiss);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('empilha varias mensagens', () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText('Adicionar'));
    fireEvent.click(screen.getByText('Adicionar'));
    expect(screen.getAllByText('Adicionado à sacola')).toHaveLength(2);
  });

  it('useToast fora do provider falha com mensagem clara', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
