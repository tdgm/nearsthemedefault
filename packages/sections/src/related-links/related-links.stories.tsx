import type { Meta, StoryObj } from '@storybook/react';
import { RelatedLinks } from './related-links';

const links = [
  { label: 'Camisetas femininas', href: '/feminino/camisetas' },
  { label: 'Camisetas masculinas', href: '/masculino/camisetas' },
  { label: 'Regatas', href: '/regatas' },
  { label: 'Guia de medidas', href: '/guia-de-medidas' },
];

const meta = { title: 'Sections/Conteudo/RelatedLinks', component: RelatedLinks, args: { links } } satisfies Meta<typeof RelatedLinks>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const TituloCustom: Story = { args: { title: 'Categorias relacionadas' } };
export const UmLink: Story = { args: { links: links.slice(0, 1) } };
export const Muitos: Story = {
  args: { links: Array.from({ length: 20 }, (_, i) => ({ label: `Categoria relacionada ${i + 1}`, href: `/categoria-${i + 1}` })) },
};
