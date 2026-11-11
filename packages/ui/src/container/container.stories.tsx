import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './container';

const meta = {
  title: 'Átomos/Container',
  component: Container,
  args: { children: <div className="bg-surface-subtle py-6 text-center">conteúdo</div> },
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComoSection: Story = { args: { as: 'section', ...meta.args } };
