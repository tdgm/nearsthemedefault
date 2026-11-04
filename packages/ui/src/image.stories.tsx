import type { Meta, StoryObj } from '@storybook/react';
import { Image } from './image';

const meta = {
  title: 'Átomos/Image',
  component: Image,
  args: {
    src: 'https://placehold.co/400x500.jpg',
    alt: 'Tênis de corrida azul, vista lateral',
    width: 400,
    height: 500,
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Prioritaria: Story = { args: { priority: true } };
export const ComAvifEWebp: Story = {
  args: {
    avifSrc: 'https://placehold.co/400x500.avif',
    webpSrc: 'https://placehold.co/400x500.webp',
  },
};
