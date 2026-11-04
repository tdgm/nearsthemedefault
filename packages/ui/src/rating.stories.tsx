import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './rating';

const meta = {
  title: 'Moléculas/Rating',
  component: Rating,
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { args: { value: 4.3, count: 128 } };
export const SemAvaliacoes: Story = { args: { value: 0 } };
export const NotaMaxima: Story = { args: { value: 5, count: 42 } };
