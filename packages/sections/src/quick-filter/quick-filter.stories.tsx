import type { Meta, StoryObj } from '@storybook/react';
import { QuickFilter } from './quick-filter';

const chips = [
  { label: 'Azul', facet: 'cor', value: 'azul' },
  { label: 'Preto', facet: 'cor', value: 'preto' },
  { label: 'Tamanho M', facet: 'tamanho', value: 'M' },
  { label: 'Até R$ 100', facet: 'preco', value: 'ate-100' },
  { label: 'Promoção', facet: 'oferta', value: 'promocao' },
];

const meta = { title: 'Sections/Conteudo/QuickFilter', component: QuickFilter, args: { chips, basePath: '/feminino/camisetas' } } satisfies Meta<typeof QuickFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComFiltroAtivo: Story = { args: { current: { cor: 'azul' } } };
export const FacetasCombinadas: Story = { args: { current: { cor: 'azul', tamanho: 'M' } } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
