import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Formulário/RadioGroup',
  component: RadioGroup,
  args: { label: 'Forma de envio' },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="sedex">
      <RadioGroupItem value="pac">PAC - até 10 dias úteis</RadioGroupItem>
      <RadioGroupItem value="sedex">Sedex - até 3 dias úteis</RadioGroupItem>
      <RadioGroupItem value="retirada" disabled>
        Retirada na loja (indisponível)
      </RadioGroupItem>
    </RadioGroup>
  ),
};
