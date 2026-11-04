import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonClasses } from './button';

describe('Button', () => {
  it('e type=button por padrao (nao envia formulario sem querer)', () => {
    render(<Button>Comprar</Button>);
    expect(screen.getByRole('button', { name: 'Comprar' })).toHaveAttribute('type', 'button');
  });

  it('dispara onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Comprar</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['sm', 'min-h-11'],
    ['md', 'min-h-12'],
    ['lg', 'min-h-14'],
  ] as const)('tamanho %s respeita o alvo de toque de 44px (%s)', (size, cls) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('desabilitado nao dispara onClick', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('carregando: aria-busy, aria-disabled, anuncia o texto e ignora o clique, mantendo o foco', () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Adicionando" onClick={onClick}>
        Comprar
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Adicionando')).toHaveClass('sr-only');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('buttonClasses reaproveita o estilo para outros elementos', () => {
    expect(buttonClasses({ variant: 'secondary', fullWidth: true })).toContain('w-full');
    expect(buttonClasses()).toContain('bg-action');
  });
});
