import type { Meta, StoryObj } from '@storybook/react';
import { PdpRelated } from './pdp-related';

const ph = (c: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="${c}"/></svg>`)}`;
const products = Array.from({ length: 5 }, (_, i) => ({
  image: { src: ph(['#d4d4d8', '#a1a1aa', '#e4e4e7'][i % 3]!), width: 600, height: 800 },
  name: `Produto ${i + 2}`,
  href: `/produto-${i + 2}/p`,
  price: 59.9 + i * 10,
  installments: { count: 3 },
}));

const meta = { title: 'Sections/PDP/PdpRelated', component: PdpRelated, parameters: { layout: 'fullscreen' }, args: { products } } satisfies Meta<typeof PdpRelated>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const TituloCustom: Story = { args: { title: 'Monte seu kit' } };
export const UmProduto: Story = { args: { products: products.slice(0, 1) } };
export const Vazio: Story = { args: { products: [] } };
