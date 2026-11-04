import type { Meta, StoryObj } from '@storybook/react';
import { Price } from './price';

const meta = {
  title: 'Moléculas/Price',
  component: Price,
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { args: { value: 199.9 } };
export const ComDesconto: Story = { args: { value: 159.9, listValue: 199.9 } };
export const ComParcelamento: Story = {
  args: { value: 199.9, installments: { count: 3, valuePerInstallment: 66.63 } },
};
export const Completo: Story = {
  args: {
    value: 159.9,
    listValue: 199.9,
    installments: { count: 4, valuePerInstallment: 39.98 },
  },
};
