import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { Tooltip } from './tooltip';

const meta = {
  title: 'Átomos/Tooltip',
  component: Tooltip,
  args: { id: 'tip', content: 'Veja a tabela de medidas', children: null },
  decorators: [(Story) => <div className="pt-12 pl-24"><Story /></div>],
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary" aria-describedby={args.id}>Guia de medidas</Button>
    </Tooltip>
  ),
};
