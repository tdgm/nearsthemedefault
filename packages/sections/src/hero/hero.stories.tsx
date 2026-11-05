import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './hero';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const slide = (n: number, color: string, extra = {}) => ({
  imageDesktop: { src: ph(1440, 560, color), width: 1440, height: 560 },
  imageMobile: { src: ph(720, 900, color), width: 720, height: 900 },
  alt: `Campanha ${n}: até 40% de desconto em camisetas`,
  href: `/campanha/${n}`,
  ...extra,
});

const slides = [
  slide(1, '#d4d4d8', { headline: 'Coleção de inverno', cta: 'Ver coleção' }),
  slide(2, '#a1a1aa', { headline: 'Frete grátis acima de R$ 299', cta: 'Aproveitar' }),
  slide(3, '#e4e4e7'),
];

const meta = { title: 'Sections/Conteudo/Hero', component: Hero, parameters: { layout: 'fullscreen' }, args: { slides } } satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const VariosSlides: Story = {};
export const RotacaoAutomatica: Story = { args: { autoplay: true, intervalMs: 5000 } };
export const SlideUnico: Story = { args: { slides: slides.slice(0, 1) } };
export const SemLegenda: Story = { args: { slides: [slide(1, '#d4d4d8'), slide(2, '#a1a1aa')] } };
export const SemLink: Story = { args: { slides: [slide(1, '#d4d4d8', { href: undefined, cta: undefined, headline: 'Só informativo' })] } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
