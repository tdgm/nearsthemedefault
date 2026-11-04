import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './rating';

const meta = { title: 'Moléculas/Rating', component: Rating, args: { value: 4.5, count: 128 } } satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Pequeno: Story = { args: { size: 'sm' } };
export const NotaMaxima: Story = { args: { value: 5, count: 1 } };
export const NotaBaixa: Story = { args: { value: 1.5, count: 12 } };
export const SemTotal: Story = { args: { value: 4, count: undefined } };
