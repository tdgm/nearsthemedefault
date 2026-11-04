import type { Meta, StoryObj } from '@storybook/react';
import { PromoBar } from './promo-bar';

const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

const meta = {
  title: 'Sections/Globais/PromoBar',
  component: PromoBar,
  parameters: { layout: 'fullscreen' },
  args: { message: 'Frete grátis em compras acima de R$ 299' },
} satisfies Meta<typeof PromoBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComLink: Story = { args: { href: '/ofertas' } };
export const ComContador: Story = { args: { href: '/ofertas', countdown: { endsAt: inDays(2) } } };
export const ComRegras: Story = { args: { countdown: { endsAt: inDays(1) }, rulesHref: '/regras-da-promocao' } };
export const SemDispensar: Story = { args: { dismissible: false } };
export const MensagemLonga: Story = {
  args: { message: 'Aproveite a campanha de fim de ano com descontos em toda a loja e parcelamento sem juros em até 10 vezes' },
};
export const Expirada: Story = { args: { countdown: { endsAt: '2020-01-01T00:00:00-03:00' } } };
