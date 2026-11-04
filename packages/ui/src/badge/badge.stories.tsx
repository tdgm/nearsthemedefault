import type { Meta, StoryObj } from '@storybook/react';
import { Badge, type BadgeTone } from './badge';

const meta = { title: 'Átomos/Badge', component: Badge, args: { children: 'Novo' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Neutro: Story = {};
export const Promocao: Story = { args: { tone: 'promo', children: '-20%' } };
export const Sucesso: Story = { args: { tone: 'success', children: 'Em estoque' } };
export const Alerta: Story = { args: { tone: 'warning', children: 'Últimas unidades' } };
export const Perigo: Story = { args: { tone: 'danger', children: 'Esgotado' } };
export const Informativo: Story = { args: { tone: 'info', children: 'Pré-venda' } };

const tones: BadgeTone[] = ['neutral', 'promo', 'success', 'warning', 'danger', 'info'];
export const Todos: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};
