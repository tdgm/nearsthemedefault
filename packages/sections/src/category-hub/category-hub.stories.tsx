import type { Meta, StoryObj } from '@storybook/react';
import { CategoryHub } from './category-hub';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const items = ['Camisetas', 'Calças', 'Vestidos', 'Casacos', 'Acessórios', 'Calçados', 'Meias'].map((label, i) => ({
  image: { src: ph(480, 600, ['#d4d4d8', '#a1a1aa', '#e4e4e7', '#c4c4cc', '#d4d4d8', '#a1a1aa', '#e4e4e7'][i]), width: 480, height: 600 },
  label,
  fromPrice: 29.9 + i * 10,
  href: `/${label.toLowerCase()}`,
}));

const meta = { title: 'Sections/Conteudo/CategoryHub', component: CategoryHub, args: { items } } satisfies Meta<typeof CategoryHub>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SeisCards: Story = {};
export const LimiteTres: Story = { args: { limit: 3 } };
export const SemPreco: Story = { args: { items: items.map((i) => ({ image: i.image, label: i.label, href: i.href })) } };
export const PoucosItens: Story = { args: { items: items.slice(0, 2) } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
