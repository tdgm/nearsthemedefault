import type { Meta, StoryObj } from '@storybook/react';
import { BreadcrumbSection } from './breadcrumb';

const items = [
  { label: 'Início', href: '/' },
  { label: 'Feminino', href: '/feminino' },
  { label: 'Camisetas' },
];

const meta = { title: 'Sections/Conteudo/Breadcrumb', component: BreadcrumbSection, args: { items } } satisfies Meta<typeof BreadcrumbSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const SoPaginaAtual: Story = { args: { items: [{ label: 'Início' }] } };
export const Longo: Story = {
  args: { items: [...items.slice(0, 2), { label: 'Camisetas', href: '/feminino/camisetas' }, { label: 'Camiseta básica de algodão orgânico com gola redonda' }] },
};
