import type { Meta, StoryObj } from '@storybook/react';
import { PdpGallery } from './pdp-gallery';

const ph = (c: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="900" height="1200" fill="${c}"/></svg>`)}`;
const images = ['#d4d4d8', '#a1a1aa', '#e4e4e7', '#c4c4cc'].map((c, i) => ({ src: ph(c), width: 900, height: 1200, alt: `Produto de exemplo, foto ${i + 1}` }));

const meta = { title: 'Sections/PDP/Gallery', component: PdpGallery, parameters: { layout: 'fullscreen' }, args: { images } } satisfies Meta<typeof PdpGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const MiniaturasEmPontos: Story = { args: { thumbs: 'dots' } };
export const SemZoom: Story = { args: { zoom: false } };
export const FotoUnica: Story = { args: { images: images.slice(0, 1) } };
export const ComVideo: Story = { args: { video: '/media/produto.mp4' } };
export const ProporcaoQuadrada: Story = { args: { aspect: 'square' } };
