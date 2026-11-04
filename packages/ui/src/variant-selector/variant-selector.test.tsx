import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VariantSelector } from './variant-selector';

const options = [
  { value: 'p', label: 'P' },
  { value: 'm', label: 'M' },
  { value: 'g', label: 'G', unavailable: true },
];

describe('VariantSelector', () => {
  it('e um radiogroup (nao uma lista de botoes), nomeado pelo eixo', () => {
    render(<VariantSelector legend="Tamanho" display="option" options={options} />);
    expect(screen.getByRole('radiogroup', { name: /Tamanho/ })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('swatch tambem e radiogroup e cada amostra tem nome acessivel', () => {
    render(
      <VariantSelector
        legend="Cor"
        display="swatch"
        options={[
          { value: 'azul', label: 'Azul', swatch: '#1b4d89' },
          { value: 'verde', label: 'Verde', swatch: '#2f6b3a' },
        ]}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: /Cor/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Azul' })).toBeInTheDocument();
  });

  it('mostra e anuncia a opcao escolhida (aria-live) e notifica', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <VariantSelector legend="Tamanho" display="option" options={options} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'M' }));
    expect(onValueChange).toHaveBeenCalledWith('m');
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(': M');
  });

  it('defaultValue vem selecionado', () => {
    render(<VariantSelector legend="Tamanho" display="option" options={options} defaultValue="p" />);
    expect(screen.getByRole('radio', { name: 'P' })).toBeChecked();
  });

  it('opcao indisponivel fica desabilitada e avisa no nome acessivel', () => {
    render(<VariantSelector legend="Tamanho" display="option" options={options} />);
    expect(screen.getByRole('radio', { name: 'G (indisponível)' })).toBeDisabled();
  });

  it('controlado reflete value', () => {
    render(<VariantSelector legend="Tamanho" display="option" options={options} value="m" />);
    expect(screen.getByRole('radio', { name: 'M' })).toBeChecked();
  });

  it('erro marca invalido e e anunciado', () => {
    render(<VariantSelector legend="Tamanho" display="option" options={options} error="Escolha um tamanho" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha um tamanho');
  });
});
