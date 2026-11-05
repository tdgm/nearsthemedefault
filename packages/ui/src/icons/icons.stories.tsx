import type { Meta, StoryObj } from '@storybook/react';
import * as icons from './icons';

const meta = { title: 'Átomos/Ícones', component: icons.MenuIcon } satisfies Meta<typeof icons.MenuIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Todos: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-4">
      {Object.entries(icons)
        .filter(([name]) => name.endsWith('Icon'))
        .map(([name, Icon]) => (
          <li key={name} className="flex w-24 flex-col items-center gap-1 text-sm">
            <Icon />
            <span>{name.replace('Icon', '')}</span>
          </li>
        ))}
    </ul>
  ),
};
export const Tamanho: Story = { args: { size: 40 } };
