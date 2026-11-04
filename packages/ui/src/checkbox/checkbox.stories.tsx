import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta = {
  title: 'Formulário/Checkbox',
  component: Checkbox,
  args: { label: 'Quero receber ofertas por e-mail' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Marcado: Story = { args: { defaultChecked: true } };
export const ComDica: Story = { args: { hint: 'Você pode cancelar quando quiser.' } };
export const ComErro: Story = { args: { label: 'Li e aceito os termos', error: 'Aceite os termos para continuar.' } };
export const Desabilitado: Story = { args: { disabled: true } };
export const Foco: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('input')?.focus();
  },
};
