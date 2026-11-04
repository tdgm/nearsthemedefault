import type { Meta, StoryObj } from '@storybook/react';
import { OverlayTrigger } from '@nears/ui';
import { MINICART_ID } from '../header/header';
import { Minicart } from './minicart';

const thumb = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="80"><rect width="100%" height="100%" fill="#d4d4d8"/></svg>')}`;
const items = [
  { id: '1', name: 'Camiseta básica', href: '/camiseta-basica/p', variant: 'Azul / M', quantity: 2, unitPrice: 79.9, image: { src: thumb, width: 64, height: 80 } },
  { id: '2', name: 'Calça reta', variant: 'Preto / 40', quantity: 1, unitPrice: 189.9, image: { src: thumb, width: 64, height: 80 } },
];

const meta = {
  title: 'Sections/Globais/Minicart',
  component: Minicart,
  parameters: { layout: 'fullscreen' },
  args: { items },
  decorators: [
    (Story) => (
      <div className="p-4">
        <OverlayTrigger targetId={MINICART_ID} className="inline-flex min-h-11 items-center rounded-md border px-4">
          Abrir carrinho
        </OverlayTrigger>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Minicart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComItens: Story = {};
export const Vazio: Story = { args: { items: [] } };
export const FreteGratisFaltando: Story = { args: { freeShippingFrom: 499 } };
export const FreteGratisAtingido: Story = { args: { freeShippingFrom: 200 } };
export const UmItem: Story = { args: { items: [{ id: '1', name: 'Meia esportiva', quantity: 1, unitPrice: 19.9 }] } };
export const MicrocopyDoNicho: Story = { args: { labels: { title: 'Sacola', empty: 'Sua sacola está vazia.' } } };
