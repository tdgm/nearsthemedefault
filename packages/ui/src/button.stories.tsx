import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'Átomos/Button',
  component: Button,
  args: { children: 'Adicionar à sacola' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Pequeno: Story = { args: { size: 'sm' } };
export const Grande: Story = { args: { size: 'lg' } };
export const Carregando: Story = { args: { loading: true } };
export const Desabilitado: Story = { args: { disabled: true } };
export const LarguraTotal: Story = { args: { fullWidth: true } };
