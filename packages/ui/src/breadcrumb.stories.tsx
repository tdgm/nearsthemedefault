import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './breadcrumb';

const meta = {
  title: 'Moléculas/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Início', href: '/' },
      { label: 'Calçados', href: '/calcados' },
      { label: 'Tênis', href: '/calcados/tenis' },
      { label: 'Tênis de corrida azul' },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
