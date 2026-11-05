import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from './radio';

const meta = { title: 'Formulário/RadioGroup', component: RadioGroup } satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

const shipping = (
  <>
    <Radio value="standard" label="Padrão — 5 dias úteis" />
    <Radio value="express" label="Expressa — 2 dias úteis" />
    <Radio value="pickup" label="Retirar na loja" />
  </>
);

export const Padrao: Story = { args: { legend: 'Forma de entrega', defaultValue: 'standard', children: shipping } };
export const Horizontal: Story = { args: { legend: 'Forma de entrega', orientation: 'horizontal', children: shipping } };
export const ComDica: Story = { args: { legend: 'Forma de entrega', hint: 'O prazo considera seu CEP.', children: shipping } };
export const ComErro: Story = { args: { legend: 'Forma de entrega', error: 'Escolha uma forma de entrega.', children: shipping } };
export const Desabilitado: Story = { args: { legend: 'Forma de entrega', disabled: true, defaultValue: 'standard', children: shipping } };

function ControlledExample() {
  const [value, setValue] = useState('express');
  return (
    <RadioGroup legend="Forma de entrega" value={value} onValueChange={setValue}>
      {shipping}
    </RadioGroup>
  );
}

export const Controlado: Story = {
  args: { legend: 'Forma de entrega', children: null },
  render: () => <ControlledExample />,
};
