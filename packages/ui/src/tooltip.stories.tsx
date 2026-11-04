import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './tooltip';
import { IconButton } from './icon-button';

const meta = {
  title: 'Moléculas/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  args: {
    content: 'Adicionar aos favoritos',
    children: (
      <IconButton
        aria-label="Favoritar"
        icon={<svg className="size-5" viewBox="0 0 24 24" aria-hidden="true" />}
      />
    ),
  },
};

export const Abaixo: Story = { args: { ...Padrao.args, side: 'bottom' } };
