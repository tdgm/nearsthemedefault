import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta = { title: 'Átomos/Skeleton', component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = { args: { shape: 'text', className: 'w-64' } };
export const Retangulo: Story = { args: { shape: 'rect', className: 'aspect-product w-48' } };
export const Circulo: Story = { args: { shape: 'circle', className: 'size-12' } };

/** Card de produto carregando: dimensoes reservadas, um unico anuncio para leitores de tela. */
export const CardDeProduto: Story = {
  render: () => (
    <div className="grid w-48 gap-2">
      <Skeleton label="Carregando produto" shape="rect" className="aspect-product w-full" />
      <Skeleton shape="text" className="w-3/4" />
      <Skeleton shape="text" className="w-1/3" />
    </div>
  ),
};
