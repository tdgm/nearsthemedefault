import type { Meta, StoryObj } from '@storybook/react';
import { BannerGrid } from './banner-grid';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const banners = ['Camisetas a partir de R$ 49', 'Jeans em até 6x sem juros', 'Novidades da semana', 'Frete grátis acima de R$ 299'].map((alt, i) => ({
  image: { src: ph(640, 800, ['#d4d4d8', '#a1a1aa', '#e4e4e7', '#c4c4cc'][i]), width: 640, height: 800 },
  alt,
  href: `/campanha/${i + 1}`,
}));

const meta = { title: 'Sections/Conteudo/BannerGrid', component: BannerGrid, args: { columns: '3', banners: banners.slice(0, 3) } } satisfies Meta<typeof BannerGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TresColunas: Story = {};
export const DuasColunas: Story = { args: { columns: '2', banners: banners.slice(0, 2) } };
export const QuatroColunas: Story = { args: { columns: '4', banners } };
export const SemLinks: Story = { args: { banners: banners.slice(0, 3).map((b) => ({ image: b.image, alt: b.alt })) } };
