import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'Átomos/Badge',
  component: Badge,
  args: { children: 'Novo' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutro: Story = {};
export const Promocional: Story = { args: { variant: 'promo', children: '-20%' } };
export const Sucesso: Story = { args: { variant: 'success', children: 'Em estoque' } };
export const Alerta: Story = { args: { variant: 'warning', children: 'Últimas unidades' } };
export const Erro: Story = { args: { variant: 'danger', children: 'Esgotado' } };
export const Informativo: Story = { args: { variant: 'info', children: 'Frete grátis' } };
