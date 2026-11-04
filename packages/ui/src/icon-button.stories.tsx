import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';

function HeartIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c1.9 0 3.3 1 5.5 3 2.2-2 3.6-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" />
    </svg>
  );
}

const meta = {
  title: 'Átomos/IconButton',
  component: IconButton,
  args: { icon: <HeartIcon />, 'aria-label': 'Favoritar' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
