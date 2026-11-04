import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './tabs';

const meta = {
  title: 'Moléculas/Tabs',
  component: Tabs,
  args: {
    label: 'Detalhes do produto',
    items: [
      { id: 'descricao', label: 'Descrição', content: 'Camiseta 100% algodão.' },
      { id: 'avaliacoes', label: 'Avaliações', content: '4,3 de 5 com 128 avaliações.' },
      { id: 'entrega', label: 'Entrega', content: 'Chega em até 3 dias úteis.' },
    ],
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
