import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'Formulário/Input',
  component: Input,
  args: { label: 'E-mail', type: 'email', autoComplete: 'email' },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComDica: Story = { args: { hint: 'Enviaremos o comprovante para este endereço.' } };
export const Obrigatorio: Story = { args: { required: true } };
export const ComErro: Story = { args: { defaultValue: 'maria@', error: 'Informe um e-mail válido, como nome@exemplo.com.' } };
export const Desabilitado: Story = { args: { disabled: true, defaultValue: 'maria@exemplo.com' } };
export const Foco: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('input')?.focus();
  },
};
export const Cep: Story = { args: { label: 'CEP', type: 'text', inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '00000-000' } };
