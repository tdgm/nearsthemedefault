import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const options = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'mg', label: 'Minas Gerais' },
];

const meta = {
  title: 'Formulário/Select',
  component: Select,
  args: { label: 'Estado', options },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComErro: Story = { args: { error: 'Selecione um estado.' } };
