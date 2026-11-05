import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './breadcrumb';

const meta = {
  title: 'Moléculas/Breadcrumb',
  component: Breadcrumb,
  args: { items: [{ label: 'Início', href: '/' }, { label: 'Camisetas', href: '/camisetas' }, { label: 'Camiseta básica' }] },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const DoisNiveis: Story = { args: { items: [{ label: 'Início', href: '/' }, { label: 'Camisetas' }] } };
export const Longo: Story = {
  args: {
    items: [
      { label: 'Início', href: '/' },
      { label: 'Feminino', href: '/feminino' },
      { label: 'Roupas', href: '/feminino/roupas' },
      { label: 'Camisetas', href: '/feminino/roupas/camisetas' },
      { label: 'Camiseta básica de algodão orgânico manga longa' },
    ],
  },
};
