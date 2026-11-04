import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { Overlay } from './overlay';
import { OverlayTrigger } from './overlay-trigger';

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

const setup = () =>
  render(
    <>
      <OverlayTrigger targetId="menu">Abrir menu</OverlayTrigger>
      <Overlay id="menu" title="Menu">
        <a href="#feminino">Feminino</a>
      </Overlay>
    </>,
  );

describe('Overlay', () => {
  it('o conteudo ja esta no HTML com o dialogo fechado (indexavel)', () => {
    const { container } = setup();
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
    expect(container.querySelector('a[href="#feminino"]')).toBeInTheDocument();
  });

  it('tem nome acessivel pelo titulo e botao Fechar de 44px dentro de form method=dialog', () => {
    const { container } = setup();
    expect(container.querySelector('dialog')).toHaveAttribute('aria-labelledby', 'menu-title');
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('method', 'dialog');
    expect(form?.querySelector('button')).toHaveClass('size-11');
  });

  it('ancora na lateral escolhida', () => {
    const { container } = render(<Overlay id="c" title="Sacola" side="right">x</Overlay>);
    expect(container.querySelector('dialog')).toHaveClass('ml-auto');
  });
});

describe('OverlayTrigger', () => {
  it('abre o dialogo alvo e marca aria-expanded', () => {
    const { container } = setup();
    const button = screen.getByRole('button', { name: 'Abrir menu' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(container.querySelector('dialog')).toHaveAttribute('open');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('volta aria-expanded=false quando o dialogo fecha', () => {
    const { container } = setup();
    const button = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(button);
    (container.querySelector('dialog') as HTMLDialogElement).close();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('clique no backdrop fecha; clique no conteudo nao', () => {
    const { container } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const dialog = container.querySelector('dialog') as HTMLDialogElement;
    fireEvent.click(container.querySelector('a') as HTMLElement);
    expect(dialog).toHaveAttribute('open');
    fireEvent.click(dialog);
    expect(dialog).not.toHaveAttribute('open');
  });

  it('abrir de novo nao duplica o listener de backdrop', () => {
    const { container } = setup();
    const button = screen.getByRole('button', { name: 'Abrir menu' });
    const dialog = container.querySelector('dialog') as HTMLDialogElement;
    fireEvent.click(button);
    dialog.close();
    fireEvent.click(button);
    expect(dialog.dataset.backdropBound).toBe('true');
  });

  it('ignora alvo inexistente sem lancar', () => {
    render(<OverlayTrigger targetId="nao-existe">Abrir</OverlayTrigger>);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))).not.toThrow();
  });
});
