import type { Meta, StoryObj } from '@storybook/react';
import { Showcase } from './showcase';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const products = Array.from({ length: 10 }, (_, i) => ({
  image: { src: ph(600, 800, ['#d4d4d8', '#a1a1aa', '#e4e4e7'][i % 3]), width: 600, height: 800 },
  name: `Camiseta modelo ${i + 1}`,
  href: `/camiseta-${i + 1}/p`,
  price: 59.9 + i * 5,
  listPrice: i % 3 === 0 ? 99.9 + i * 5 : undefined,
  installments: { count: 3 },
  wishlistAction: '/api/favoritos',
}));

const tabs = [
  { label: 'Mais vendidos', products: products.slice(0, 8) },
  { label: 'Lançamentos', products: products.slice(2, 10) },
  { label: 'Ofertas', products: products.filter((p) => p.listPrice) },
];

const meta = {
  title: 'Sections/Conteudo/Showcase',
  component: Showcase,
  parameters: { layout: 'fullscreen' },
  args: { products, title: 'Destaques da semana' },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Estatica: Story = {};
export const Abas: Story = { args: { variant: 'tabs', tabs, products: [] } };
export const Personalizada: Story = { args: { variant: 'personalized', title: undefined } };
export const Recomendada: Story = { args: { variant: 'recommended', title: undefined } };
export const Favoritos: Story = { args: { variant: 'wishlist', title: undefined } };
export const FavoritosVazio: Story = { args: { variant: 'wishlist', title: undefined, products: [] } };
export const LimiteQuatro: Story = { args: { limit: 4 } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
