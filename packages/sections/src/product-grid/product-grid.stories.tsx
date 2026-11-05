import type { Meta, StoryObj } from '@storybook/react';
import { ProductGrid } from './product-grid';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const products = Array.from({ length: 12 }, (_, i) => ({
  image: { src: ph(600, 800, ['#d4d4d8', '#a1a1aa', '#e4e4e7'][i % 3]), width: 600, height: 800 },
  name: `Camiseta modelo ${i + 1}`,
  href: `/camiseta-${i + 1}/p`,
  price: 59.9 + i * 5,
  listPrice: i % 3 === 0 ? 99.9 + i * 5 : undefined,
  installments: { count: 3 },
  badges: i % 4 === 0 ? [{ label: 'Novo', tone: 'info' as const }] : undefined,
  wishlistAction: '/api/favoritos',
}));

const filters = [
  { id: 'category', label: 'Categoria', options: [{ value: 'camisetas', label: 'Camisetas', count: 42 }, { value: 'regatas', label: 'Regatas', count: 12 }] },
  { id: 'brand', label: 'Marca', options: [{ value: 'a', label: 'Marca A', count: 20 }, { value: 'b', label: 'Marca B', count: 8 }] },
  { id: 'price', label: 'Preço', options: [{ value: 'ate-100', label: 'Até R$ 100' }, { value: '100-200', label: 'R$ 100 a R$ 200' }] },
];

const meta = {
  title: 'Sections/Conteudo/ProductGrid',
  component: ProductGrid,
  parameters: { layout: 'fullscreen' },
  args: { products, total: 96, page: 1, pageSize: 24, basePath: '/feminino/camisetas', facets: ['category', 'brand', 'price'], filters },
} satisfies Meta<typeof ProductGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const PaginaDoMeio: Story = { args: { page: 3, query: { page: '3', sort: 'price_asc' } } };
export const ComFiltrosAplicados: Story = { args: { query: { brand: ['a'], category: 'camisetas' } } };
export const SemFiltros: Story = { args: { facets: [], filters: [] } };
export const UmUnicoResultado: Story = { args: { products: products.slice(0, 1), total: 1 } };
export const Vazio: Story = { args: { products: [], total: 0, query: { brand: 'a' } } };
export const CincoColunas: Story = { args: { columns: { xs: 2, md: 3, lg: 5 } } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
