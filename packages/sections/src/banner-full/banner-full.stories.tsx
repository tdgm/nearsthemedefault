import type { Meta, StoryObj } from '@storybook/react';
import { BannerFull } from './banner-full';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const args = {
  image: { src: ph(960, 720), width: 960, height: 720 },
  alt: 'Pessoa usando camiseta básica em um parque',
  headline: 'Conforto para o dia inteiro',
  body: 'Malha leve e macia, do básico ao look de fim de semana.',
  cta: 'Ver a coleção',
  href: '/colecao/basicos',
};

const meta = { title: 'Sections/Conteudo/BannerFull', component: BannerFull, parameters: { layout: 'fullscreen' }, args } satisfies Meta<typeof BannerFull>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ImagemAEsquerda: Story = {};
export const ImagemADireita: Story = { args: { imageSide: 'right' } };
export const SemBotao: Story = { args: { cta: undefined, href: undefined } };
export const SoTitulo: Story = { args: { body: undefined, cta: undefined, href: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
