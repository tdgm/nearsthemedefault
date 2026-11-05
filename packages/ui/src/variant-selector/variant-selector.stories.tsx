import type { Meta, StoryObj } from '@storybook/react';
import { VariantSelector } from './variant-selector';

const sizes = [
  { value: 'p', label: 'P' },
  { value: 'm', label: 'M' },
  { value: 'g', label: 'G', unavailable: true },
  { value: 'gg', label: 'GG' },
];
const colors = [
  { value: 'azul', label: 'Azul', swatch: '#1b4d89' },
  { value: 'verde', label: 'Verde', swatch: '#2f6b3a' },
  { value: 'areia', label: 'Areia', swatch: '#d8c7a3', unavailable: true },
];

const meta = {
  title: 'Formulário/VariantSelector',
  component: VariantSelector,
  args: { legend: 'Tamanho', display: 'option', options: sizes },
} satisfies Meta<typeof VariantSelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Opcoes: Story = {};
export const OpcaoSelecionada: Story = { args: { defaultValue: 'm' } };
export const Amostras: Story = { args: { legend: 'Cor', display: 'swatch', options: colors, defaultValue: 'azul' } };
export const SemSelecao: Story = { args: { legend: 'Cor', display: 'swatch', options: colors } };
export const ComErro: Story = { args: { error: 'Escolha um tamanho para continuar.' } };
export const Voltagem: Story = {
  args: { legend: 'Voltagem', options: [{ value: '127', label: '127 V' }, { value: '220', label: '220 V' }], defaultValue: '220' },
};
export const Foco: Story = {
  args: { defaultValue: 'm' },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLInputElement>('input:checked')?.focus();
  },
};
