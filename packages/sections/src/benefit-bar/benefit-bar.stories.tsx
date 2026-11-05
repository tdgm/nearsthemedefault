import type { Meta, StoryObj } from '@storybook/react';
import { BenefitBar } from './benefit-bar';

const items = [
  { icon: '✓', label: 'Frete grátis acima de R$ 299', href: '/frete' },
  { icon: '↺', label: 'Troca grátis em 30 dias', href: '/trocas-e-devolucoes' },
  { icon: '✦', label: 'Parcele em até 6x sem juros' },
  { icon: '☎', label: 'Atendimento de seg. a sex.' },
];

const meta = { title: 'Sections/Conteudo/BenefitBar', component: BenefitBar, parameters: { layout: 'fullscreen' }, args: { items } } satisfies Meta<typeof BenefitBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const SemLinks: Story = { args: { items: items.map((i) => ({ icon: i.icon, label: i.label })) } };
export const UmItem: Story = { args: { items: items.slice(0, 1) } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
