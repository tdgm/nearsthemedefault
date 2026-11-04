import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('liga a label ao input e alterna ao clicar na label', () => {
    render(<Checkbox label="Aceito os termos" />);
    const checkbox = screen.getByLabelText('Aceito os termos');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(screen.getByText('Aceito os termos'));
    expect(checkbox).toBeChecked();
  });
});
