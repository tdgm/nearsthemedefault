import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './pagination';

const meta = {
  title: 'Moléculas/Pagination',
  component: Pagination,
  args: { totalPages: 6, buildHref: (page: number) => `/categoria/tenis?page=${page}` },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Meio: Story = { args: { currentPage: 3 } };
export const PrimeiraPagina: Story = { args: { currentPage: 1 } };
export const UltimaPagina: Story = { args: { currentPage: 6 } };
