import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './accordion';

const items = [
  { id: 'desc', title: 'Descrição', content: <p>Peça versátil para o dia a dia, com caimento leve.</p>, defaultOpen: true },
  { id: 'comp', title: 'Composição', content: <p>100% algodão.</p> },
  { id: 'care', title: 'Cuidados', content: <p>Lavar a 30 °C, não usar alvejante.</p> },
];

const meta = { title: 'Moléculas/Accordion', component: Accordion, args: { items } } satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Exclusivo: Story = { args: { name: 'pdp-info' } };
export const TodosFechados: Story = { args: { items: items.map((i) => ({ ...i, defaultOpen: false })) } };
