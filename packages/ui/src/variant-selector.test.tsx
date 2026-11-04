import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VariantSelector } from './variant-selector';

describe('VariantSelector', () => {
  it('e um radiogroup, nunca uma lista de botoes (CLAUDE.md > Acessibilidade)', () => {
    render(
      <VariantSelector
        label="Cor"
        display="swatch"
        defaultValue="preto"
        options={[
          { value: 'preto', label: 'Preto', swatchColor: '#000' },
          { value: 'branco', label: 'Branco', swatchColor: '#fff' },
        ]}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Cor' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Preto' })).toHaveAttribute('aria-checked', 'true');
  });

  it('display option mostra o texto da opcao', () => {
    render(
      <VariantSelector
        label="Tamanho"
        display="option"
        options={[{ value: 'm', label: 'M' }]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'M' })).toBeInTheDocument();
  });

  it('opcao disabled nao pode ser selecionada', () => {
    render(
      <VariantSelector
        label="Tamanho"
        display="option"
        options={[{ value: 'gg', label: 'GG', disabled: true }]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'GG' })).toHaveAttribute('aria-disabled', 'true');
  });
});
