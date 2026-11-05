import type { Meta, StoryObj } from '@storybook/react';
import { PdpBuybox } from './pdp-buybox';

const colors = {
  id: 'color',
  label: 'Cor',
  display: 'swatch' as const,
  options: [
    { value: 'azul', label: 'Azul', swatch: '#1b4d89' },
    { value: 'vinho', label: 'Vinho', swatch: '#8a2b2b' },
    { value: 'verde', label: 'Verde', swatch: '#2f6b3f', unavailable: true },
  ],
};
const sizes = { id: 'size', label: 'Tamanho', display: 'option' as const, options: ['P', 'M', 'G'].map((v) => ({ value: v.toLowerCase(), label: v })) };

const meta = {
  title: 'Sections/PDP/Buybox',
  component: PdpBuybox,
  parameters: { layout: 'fullscreen' },
  args: { name: 'Produto de exemplo', price: 179.9, installments: { count: 3 }, sku: 'SKU-0001', addToCartAction: '/api/cart/items', rating: { value: 4.5, count: 128 } },
} satisfies Meta<typeof PdpBuybox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemVariacao: Story = {};
export const ComVariacoes: Story = { args: { variantSelectors: [colors, sizes], guideHref: '#guia' } };
export const EmPromocao: Story = { args: { listPrice: 249.9, variantSelectors: [sizes] } };
export const SemEstoque: Story = { args: { availability: 'out_of_stock', variantSelectors: [sizes] } };
export const PreVenda: Story = { args: { availability: 'preorder' } };
export const SemEndpoint: Story = { args: { addToCartAction: undefined } };
export const SemBarraFixa: Story = { args: { stickyMobile: false } };
