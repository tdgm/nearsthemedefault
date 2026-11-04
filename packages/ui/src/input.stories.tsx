import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'Formulário/Input',
  component: Input,
  args: { label: 'E-mail' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComDica: Story = { args: { hint: 'Usaremos para enviar a confirmação do pedido.' } };
export const ComErro: Story = { args: { error: 'Informe um e-mail válido.' } };
export const Obrigatorio: Story = { args: { required: true } };
export const Desabilitado: Story = { args: { disabled: true, value: 'cliente@exemplo.com' } };
