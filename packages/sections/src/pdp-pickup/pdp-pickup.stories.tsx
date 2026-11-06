import type { Meta, StoryObj } from '@storybook/react';
import { PdpPickup } from './pdp-pickup';

const meta = { title: 'Sections/PDP/Pickup', component: PdpPickup } satisfies Meta<typeof PdpPickup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemCep: Story = {};

export const ComRetirada: Story = {
  args: {
    cep: '01310100',
    quote: {
      store: { id: 'loja-sp', name: 'Loja Paulista', address: 'Bela Vista, São Paulo - SP' },
      distanceKm: 0.6,
      pickup: { etaMinutes: 60 },
    },
  },
};

export const ComEntrega: Story = {
  args: {
    cep: '30130000',
    quote: {
      store: { id: 'loja-bh', name: 'Loja Afonso Pena', address: 'Centro, Belo Horizonte - MG' },
      distanceKm: 3.2,
      delivery: { etaMinutes: 180 },
    },
  },
};

export const SemOpcao: Story = {
  args: { cep: '99999999', quote: { error: 'Não há retirada nem entrega por loja disponível para este CEP.' } },
};
