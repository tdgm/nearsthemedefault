import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './pagination';

const hrefFor = (p: number) => (p === 1 ? '#' : `#page=${p}`);
const meta = { title: 'Moléculas/Pagination', component: Pagination, args: { currentPage: 1, totalPages: 8, hrefFor } } satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primeira: Story = {};
export const Meio: Story = { args: { currentPage: 10, totalPages: 20 } };
export const Ultima: Story = { args: { currentPage: 8 } };
export const Poucas: Story = { args: { currentPage: 2, totalPages: 3 } };
