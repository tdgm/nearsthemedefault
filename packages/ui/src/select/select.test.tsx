import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B', disabled: true },
];

describe('Select', () => {
  it('e um combobox nativo com label', () => {
    render(<Select label="Ordenar" options={options} />);
    expect(screen.getByRole('combobox', { name: 'Ordenar' })).toBeInTheDocument();
  });

  it('placeholder vira a primeira opcao vazia', () => {
    render(<Select label="Estado" options={options} placeholder="Selecione" />);
    expect(screen.getAllByRole('option')[0]).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('respeita opcao desabilitada e dispara onChange', () => {
    let value = '';
    render(<Select label="Ordenar" options={options} onChange={(e) => (value = e.target.value)} />);
    expect(screen.getByRole('option', { name: 'B' })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    expect(value).toBe('a');
  });

  it('erro e dica descrevem o campo', () => {
    render(<Select label="Estado" options={options} hint="Dica" error="Obrigatorio" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Dica Obrigatorio');
  });
});
