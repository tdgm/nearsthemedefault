import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './tabs';

const tabs = [
  { id: 'a', label: 'Mulher', content: <p>Vitrine feminina com os destaques da semana.</p> },
  { id: 'b', label: 'Homem', content: <p>Vitrine masculina com os destaques da semana.</p> },
  { id: 'c', label: 'Infantil', content: <p>Vitrine infantil com os destaques da semana.</p> },
];
const meta = { title: 'Moléculas/Tabs', component: Tabs, args: { tabs, label: 'Vitrine por departamento' } } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const AbaInicial: Story = { args: { defaultId: 'b' } };
