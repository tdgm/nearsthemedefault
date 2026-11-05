import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './carousel';

const card = (n: number) => (
  <div className="grid h-40 place-items-center rounded-lg bg-surface-subtle text-lg font-bold">Slide {n}</div>
);
const slides = Array.from({ length: 6 }, (_, i) => card(i + 1));

const meta = { title: 'Organismos/Carousel', component: Carousel, args: { slides, label: 'Destaques da semana' } } satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UmPorVez: Story = {};
export const TresPorVez: Story = { args: { perView: 3 } };
export const QuatroPorVez: Story = { args: { perView: 4 } };
export const SlideUnico: Story = { args: { slides: [card(1)] } };
