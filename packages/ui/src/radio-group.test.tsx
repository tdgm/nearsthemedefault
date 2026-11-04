import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup', () => {
  it('expoe role=radiogroup com o aria-label', () => {
    render(
      <RadioGroup label="Forma de envio" defaultValue="sedex">
        <RadioGroupItem value="pac">PAC</RadioGroupItem>
        <RadioGroupItem value="sedex">Sedex</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Forma de envio' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sedex' })).toHaveAttribute('aria-checked', 'true');
  });
});
