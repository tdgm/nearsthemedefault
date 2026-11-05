import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './product-card';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const args = {
  image: { src: ph(600, 800), width: 600, height: 800 },
  name: 'Camiseta básica de algodão',
  href: '/camiseta-basica/p',
  price: 79.9,
  wishlistAction: '/api/favoritos',
};

const meta = {
  title: 'Sections/Conteudo/ProductCard',
  component: ProductCard,
  decorators: [(Story) => <div className="w-64 p-4"><Story /></div>],
  args,
} satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComDesconto: Story = { args: { listPrice: 129.9, installments: { count: 3 }, badges: [{ label: 'Oferta', tone: 'promo' }] } };
export const ComVariacoes: Story = {
  args: {
    variantPreview: [
      { label: 'Azul', color: '#1d4ed8' },
      { label: 'Preto', color: '#18181b' },
      { label: 'Off-white', color: '#f5f5f4' },
    ],
  },
};
export const MuitasVariacoes: Story = {
  args: { variantPreview: Array.from({ length: 8 }, (_, i) => ({ label: `Cor ${i + 1}`, color: `hsl(${i * 40} 60% 45%)` })) },
};
export const VariacaoSoTexto: Story = { args: { variantPreview: [{ label: '110V' }, { label: '220V' }] } };
export const ComHoverImage: Story = { args: { hoverImage: { src: ph(600, 800, '#a1a1aa'), width: 600, height: 800 } } };
export const AdicionarRapido: Story = { args: { quickAdd: true, quickAddAction: '/api/sacola' } };
export const SemFavoritar: Story = { args: { wishlist: false } };
export const MultiplosSelos: Story = {
  args: { badges: [{ label: 'Novo', tone: 'info' }, { label: 'Últimas unidades', tone: 'neutral' }, { label: '-30%', tone: 'promo' }], listPrice: 99.9 },
};
export const NomeLongo: Story = { args: { name: 'Camiseta básica de algodão orgânico com gola redonda e acabamento reforçado nos ombros' } };
export const ProporcaoQuadrada: Story = { args: { aspect: 'square' } };
export const AcimaDaDobra: Story = { args: { priority: true } };
