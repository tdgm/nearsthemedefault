import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './link';

const meta = {
  title: 'Átomos/Link',
  component: Link,
  args: { href: '/categoria/tenis', children: 'Ver todos os tênis' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Mudo: Story = { args: { variant: 'muted' } };
export const EmLinha: Story = { args: { variant: 'inline' } };
export const Externo: Story = { args: { href: 'https://example.com', target: '_blank', children: 'Ver política de troca' } };
