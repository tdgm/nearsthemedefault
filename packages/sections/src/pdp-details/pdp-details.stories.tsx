import type { Meta, StoryObj } from '@storybook/react';
import { PdpDetails } from './pdp-details';

const meta = {
  title: 'Sections/PDP/Details',
  component: PdpDetails,
  parameters: { layout: 'fullscreen' },
  args: {
    description: 'Este produto é um item de exemplo, com materiais e usos descritos no CMS.\n\nSegundo parágrafo com diferenciais.',
    specs: [
      { name: 'Marca', value: 'Marca 1' },
      { name: 'Garantia', value: '12 meses' },
    ],
    instructions: 'Siga as orientações de uso e conservação.',
  },
} satisfies Meta<typeof PdpDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComGuia: Story = {
  args: { guide: { columns: ['Tamanho', 'Peito (cm)', 'Cintura (cm)'], rows: [['P', '92', '78'], ['M', '98', '84'], ['G', '104', '90']] } },
};
export const SoDescricao: Story = { args: { specs: [], instructions: undefined } };
export const Vazio: Story = { args: { description: undefined, specs: [], instructions: undefined } };
