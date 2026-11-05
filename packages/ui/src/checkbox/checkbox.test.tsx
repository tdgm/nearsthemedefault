import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('e um checkbox com nome acessivel e alterna', () => {
    render(<Checkbox label="Aceito" />);
    const box = screen.getByRole('checkbox', { name: 'Aceito' });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
  });

  it('alvo de toque e a linha inteira (44px)', () => {
    render(<Checkbox label="Aceito" />);
    expect(screen.getByText('Aceito').closest('label')).toHaveClass('min-h-11');
  });

  it('erro marca aria-invalid e e descrito', () => {
    render(<Checkbox label="Aceito" error="Obrigatorio" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('Obrigatorio');
  });

  it('desabilitado nao alterna', () => {
    render(<Checkbox label="Aceito" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
