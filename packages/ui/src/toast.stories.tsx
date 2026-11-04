import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './toast';

const meta = {
  title: 'Moléculas/Toast',
  component: Toast,
  args: { open: true, onClose: () => {}, children: 'Produto adicionado à sacola.' },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutro: Story = {};
export const Sucesso: Story = { args: { variant: 'success' } };
export const Erro: Story = { args: { variant: 'danger', children: 'Não foi possível adicionar o item.' } };
export const Fechado: Story = { args: { open: false } };
