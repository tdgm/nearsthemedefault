import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const options = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'old', label: 'Descontinuado', disabled: true },
];

const meta = { title: 'Formulário/Select', component: Select, args: { label: 'Ordenar por', options } } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComPlaceholder: Story = { args: { placeholder: 'Selecione', label: 'Estado' } };
export const ComDica: Story = { args: { hint: 'Altera a ordem da lista.' } };
export const ComErro: Story = { args: { placeholder: 'Selecione', error: 'Escolha uma opção.' } };
export const Desabilitado: Story = { args: { disabled: true } };
