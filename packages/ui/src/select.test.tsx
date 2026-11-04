import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

describe('Select', () => {
  it('lista as opcoes e liga a label', () => {
    render(<Select label="Estado" options={[{ value: 'sp', label: 'São Paulo' }]} />);
    const select = screen.getByLabelText('Estado');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'São Paulo' })).toBeInTheDocument();
  });
});
