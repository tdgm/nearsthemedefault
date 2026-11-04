import type { Meta, StoryObj } from '@storybook/react';
import { Price } from './price';

const meta = { title: 'Moléculas/Price', component: Price, args: { price: 129.9 } } satisfies Meta<typeof Price>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Simples: Story = {};
export const ComDesconto: Story = { args: { price: 99.9, listPrice: 149.9 } };
export const ComParcelamento: Story = { args: { price: 299.9, installments: { count: 6 } } };
export const Completo: Story = { args: { price: 199.9, listPrice: 299.9, installments: { count: 4 } } };
export const Pequeno: Story = { args: { price: 59.9, listPrice: 79.9, size: 'sm' } };
export const Grande: Story = { args: { price: 59.9, listPrice: 79.9, size: 'lg', installments: { count: 3 } } };
export const SemSelo: Story = { args: { price: 59.9, listPrice: 79.9, showDiscount: false } };
