import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './link';
import { buttonClasses } from '../button/button';

const meta = {
  title: 'Átomos/Link',
  component: Link,
  args: { href: '/ofertas', children: 'Ver todas as ofertas' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoTexto: Story = {
  render: (args) => (
    <p>
      Confira também <Link {...args} /> da semana.
    </p>
  ),
};
export const Isolado: Story = { args: { variant: 'standalone' } };
export const Externo: Story = { args: { href: 'https://example.com', external: true, children: 'Política do parceiro' } };
export const ComAparenciaDeBotao: Story = {
  render: (args) => <Link {...args} className={buttonClasses({ variant: 'primary' })} variant="standalone" />,
};
export const Foco: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('a')?.focus();
  },
};
