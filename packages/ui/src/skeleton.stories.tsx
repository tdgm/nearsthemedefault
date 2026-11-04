import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Átomos/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = { args: { className: 'h-4 w-32' } };
export const CardDeProduto: Story = { args: { aspectRatio: '3 / 4', className: 'w-48' } };
