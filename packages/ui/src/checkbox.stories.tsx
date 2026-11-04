import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta = {
  title: 'Formulário/Checkbox',
  component: Checkbox,
  args: { label: 'Quero receber novidades por e-mail' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Marcado: Story = { args: { defaultChecked: true } };
export const Desabilitado: Story = { args: { disabled: true } };
