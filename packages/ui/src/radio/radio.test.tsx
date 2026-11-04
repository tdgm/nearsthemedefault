import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './radio';

const options = (
  <>
    <Radio value="a" label="Opcao A" />
    <Radio value="b" label="Opcao B" />
  </>
);

describe('RadioGroup', () => {
  it('e um radiogroup nomeado pela legend', () => {
    render(<RadioGroup legend="Entrega">{options}</RadioGroup>);
    expect(screen.getByRole('radiogroup', { name: 'Entrega' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('radios compartilham o mesmo name (setas nativas)', () => {
    render(<RadioGroup legend="Entrega" name="entrega">{options}</RadioGroup>);
    for (const r of screen.getAllByRole('radio')) expect(r).toHaveAttribute('name', 'entrega');
  });

  it('defaultValue marca a opcao inicial', () => {
    render(<RadioGroup legend="Entrega" defaultValue="b">{options}</RadioGroup>);
    expect(screen.getByRole('radio', { name: 'Opcao B' })).toBeChecked();
  });

  it('controlado: reflete value e notifica a troca', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup legend="Entrega" value="a" onValueChange={onValueChange}>
        {options}
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Opcao A' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Opcao B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('desabilitado bloqueia todos os radios', () => {
    render(<RadioGroup legend="Entrega" disabled>{options}</RadioGroup>);
    for (const r of screen.getAllByRole('radio')) expect(r).toBeDisabled();
  });

  it('erro marca o grupo como invalido e e anunciado', () => {
    render(<RadioGroup legend="Entrega" error="Escolha uma">{options}</RadioGroup>);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma');
  });

  it('cada opcao tem alvo de 44px', () => {
    render(<RadioGroup legend="Entrega">{options}</RadioGroup>);
    expect(screen.getByText('Opcao A').closest('label')).toHaveClass('min-h-11');
  });
});
