import type { Meta, StoryObj } from '@storybook/react';
import { PdpShipping } from './pdp-shipping';

const meta = { title: 'Sections/PDP/Shipping', component: PdpShipping, args: { helpHref: 'https://example.com/cep' } } satisfies Meta<typeof PdpShipping>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {};
export const ComOpcoes: Story = {
  args: {
    cep: '01310100',
    quote: {
      options: [
        { id: 'padrao', name: 'Entrega padrão', price: 19.9, days: [3, 5] },
        { id: 'expressa', name: 'Entrega expressa', price: 34.9, days: [1, 2] },
        { id: 'retirada', name: 'Retirar na loja', price: 0, days: [1, 1] },
      ],
    },
  },
};
export const CepInvalido: Story = { args: { cep: '123', quote: { error: 'Informe um CEP válido com 8 dígitos.' } } };
export const SemCampo: Story = { args: { zipInput: false } };
