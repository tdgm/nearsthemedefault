import type { Meta, StoryObj } from '@storybook/react';
import { OverlayTrigger } from '@nears/ui';
import { NAV_DRAWER_ID } from '../header/header';
import { NavDrawer } from './nav-drawer';

const departments = [
  {
    label: 'Feminino',
    href: '/feminino',
    highlight: { label: 'Novidades', href: '/feminino/novidades' },
    groups: [
      { label: 'Roupas', href: '/feminino/roupas', links: [{ label: 'Camisetas', href: '/feminino/roupas/camisetas' }, { label: 'Vestidos', href: '/feminino/roupas/vestidos' }] },
      { label: 'Acessórios', links: [{ label: 'Bolsas', href: '/feminino/acessorios/bolsas' }] },
    ],
    promo: { title: 'Coleção de verão', href: '/colecao-verao' },
  },
  { label: 'Masculino', href: '/masculino', groups: [{ label: 'Roupas', links: [{ label: 'Camisetas', href: '/masculino/roupas/camisetas' }] }] },
  { label: 'Ofertas', href: '/ofertas' },
];

const meta = {
  title: 'Sections/Globais/NavDrawer',
  component: NavDrawer,
  parameters: { layout: 'fullscreen' },
  args: { departments },
  decorators: [
    (Story) => (
      <div className="p-4">
        <OverlayTrigger targetId={NAV_DRAWER_ID} className="inline-flex min-h-11 items-center rounded-md border px-4">
          Abrir menu
        </OverlayTrigger>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const SoLinks: Story = { args: { departments: [{ label: 'Feminino', href: '/feminino' }, { label: 'Masculino', href: '/masculino' }] } };
export const ComMicrocopyDoNicho: Story = { args: { labels: { title: 'Categorias', nav: 'Categorias da loja' } } };
