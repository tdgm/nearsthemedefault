import type { Meta, StoryObj } from '@storybook/react';
import { VariantSelector } from './variant-selector';

const meta = {
  title: 'Formulário/VariantSelector',
  component: VariantSelector,
} satisfies Meta<typeof VariantSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cor: Story = {
  args: {
    label: 'Cor',
    display: 'swatch',
    defaultValue: 'preto',
    options: [
      { value: 'preto', label: 'Preto', swatchColor: '#171B21' },
      { value: 'branco', label: 'Branco', swatchColor: '#FFFFFF' },
      { value: 'azul', label: 'Azul', swatchColor: '#3F5BE0' },
    ],
  },
};

export const Tamanho: Story = {
  args: {
    label: 'Tamanho',
    display: 'option',
    defaultValue: 'm',
    options: [
      { value: 'p', label: 'P' },
      { value: 'm', label: 'M' },
      { value: 'g', label: 'G' },
      { value: 'gg', label: 'GG', disabled: true },
    ],
  },
};
