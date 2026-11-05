import type { Meta, StoryObj } from '@storybook/react';
import { Image, type ImageLoader } from './image';

// Placeholder SVG inline: sem rede nem dependencia de CDN nas stories.
const svg = (w: number, h: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#d4d4d8"/></svg>`)}`;

const loader: ImageLoader = (src) => src;

const meta = {
  title: 'Átomos/Image',
  component: Image,
  args: { src: svg(400, 500), alt: 'Camiseta básica azul', width: 400, height: 500, sizes: '(min-width: 768px) 25vw, 50vw' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AbaixoDaDobra: Story = {};
export const AcimaDaDobra: Story = { args: { priority: true } };
export const ComPicture: Story = { args: { loader, widths: [320, 640] } };
export const Decorativa: Story = { args: { alt: '' } };
