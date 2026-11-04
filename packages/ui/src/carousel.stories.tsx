import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './carousel';

const meta = {
  title: 'Moléculas/Carousel',
  component: Carousel,
  args: { label: 'Produtos relacionados' },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: (args) => (
    <Carousel {...args}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex h-40 w-32 items-center justify-center rounded-md bg-surface-subtle text-on-surface">
          Item {i + 1}
        </div>
      ))}
    </Carousel>
  ),
};
