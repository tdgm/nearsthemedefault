import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle } from './section-title';

const meta = { title: 'Sections/Conteudo/SectionTitle', component: SectionTitle, args: { text: 'Compre por categoria' } } satisfies Meta<typeof SectionTitle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComLink: Story = { args: { href: '/categorias' } };
export const Nivel3: Story = {
  render: (args) => (
    <>
      <h2 className="px-4 pt-4 text-xl font-bold">Departamento</h2>
      <SectionTitle {...args} level="h3" />
    </>
  ),
};
