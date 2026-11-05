import type { Meta, StoryObj } from '@storybook/react';
import { PdpReviews } from './pdp-reviews';

const items = [
  { author: 'Cliente 1', rating: 5, date: '2026-03-10T12:00:00-03:00', title: 'Recomendo', body: 'Chegou no prazo e é como descrito.' },
  { author: 'Cliente 2', rating: 4, date: '2026-04-02T09:30:00-03:00', body: 'Bom custo-benefício.' },
];

const meta = { title: 'Sections/PDP/Reviews', component: PdpReviews, parameters: { layout: 'fullscreen' }, args: { provider: 'nears', aggregate: { rating: 4.5, count: 128 }, items } } satisfies Meta<typeof PdpReviews>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const SemAvaliacoes: Story = { args: { aggregate: undefined, items: [] } };
export const SoAgregado: Story = { args: { items: [] } };
