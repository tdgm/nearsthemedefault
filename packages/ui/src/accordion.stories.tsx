import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem } from './accordion';

const meta = {
  title: 'Moléculas/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: () => (
    <Accordion>
      <AccordionItem title="Composição" name="pdp-accordion" defaultOpen>
        100% algodão.
      </AccordionItem>
      <AccordionItem title="Como lavar" name="pdp-accordion">
        Lavar à máquina, água fria.
      </AccordionItem>
      <AccordionItem title="Avaliações" name="pdp-accordion">
        4,3 de 5 com 128 avaliações.
      </AccordionItem>
    </Accordion>
  ),
};
