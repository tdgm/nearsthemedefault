import type { Meta, StoryObj } from '@storybook/react';
import { EventBanner } from './event-banner';

const ph = (w: number, h: number, c = "#d4d4d8") => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`)}`;

const args = {
  imageDesktop: { src: ph(1440, 320), width: 1440, height: 320 },
  imageMobile: { src: ph(720, 360, '#a1a1aa'), width: 720, height: 360 },
  alt: 'Liquidação de inverno: até 50% de desconto até domingo',
  href: '/campanha/liquidacao',
};

const meta = { title: 'Sections/Conteudo/EventBanner', component: EventBanner, parameters: { layout: 'fullscreen' }, args } satisfies Meta<typeof EventBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComLink: Story = {};
export const SemLink: Story = { args: { href: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
