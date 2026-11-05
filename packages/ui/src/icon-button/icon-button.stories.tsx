import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';

const Bag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const meta = {
  title: 'Átomos/IconButton',
  component: IconButton,
  args: { label: 'Abrir carrinho', icon: <Bag /> },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComContador: Story = { args: { badge: 3 } };
export const ContadorAlto: Story = { args: { badge: 120 } };
export const Secundario: Story = { args: { variant: 'secondary' } };
export const Desabilitado: Story = { args: { disabled: true } };
export const Foco: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('button')?.focus();
  },
};
