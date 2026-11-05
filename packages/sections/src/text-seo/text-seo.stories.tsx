import type { Meta, StoryObj } from '@storybook/react';
import { TextSeo } from './text-seo';

const richText = `Camiseta básica é a peça de malha de uso diário, indicada para compor looks casuais em qualquer estação.

O algodão penteado é macio e respira bem, enquanto o fio com elastano ajuda a manter o caimento depois das lavagens.

Para escolher o tamanho, compare as medidas da peça com as de uma camiseta que já veste bem e consulte a tabela de medidas.

Lave do avesso em água fria e seque à sombra para preservar a cor e a modelagem por mais tempo.`;

const meta = {
  title: 'Sections/Conteudo/TextSEO',
  component: TextSeo,
  args: { title: 'O que é uma camiseta básica?', richText },
} satisfies Meta<typeof TextSeo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Recolhivel: Story = {};
export const SempreAberto: Story = { args: { collapsible: false } };
export const SoUmParagrafo: Story = { args: { richText: 'Resposta curta e direta.' } };
export const SemTitulo: Story = { args: { title: undefined } };
