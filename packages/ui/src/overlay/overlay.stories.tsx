import type { Meta, StoryObj } from '@storybook/react';
import { Overlay } from './overlay';
import { OverlayTrigger } from './overlay-trigger';

const meta = { title: 'Organismos/Overlay', component: Overlay, args: { id: 'demo', title: 'Menu', children: null } } satisfies Meta<typeof Overlay>;
export default meta;
type Story = StoryObj<typeof meta>;

const demo = (side: 'left' | 'right'): Story => ({
  render: (args) => (
    <>
      <OverlayTrigger targetId={args.id} className="inline-flex min-h-11 items-center rounded-md border px-4">
        Abrir painel
      </OverlayTrigger>
      <Overlay {...args} side={side}>
        <ul className="p-4">
          <li><a className="inline-flex min-h-11 items-center underline" href="#feminino">Feminino</a></li>
          <li><a className="inline-flex min-h-11 items-center underline" href="#masculino">Masculino</a></li>
        </ul>
      </Overlay>
    </>
  ),
});
export const Esquerda: Story = demo('left');
export const Direita: Story = demo('right');
