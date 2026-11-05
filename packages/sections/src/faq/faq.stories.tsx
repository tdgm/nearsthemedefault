import type { Meta, StoryObj } from '@storybook/react';
import { Faq } from './faq';

const items = [
  { question: 'Qual o prazo de entrega?', answer: 'O prazo médio é de 3 a 7 dias úteis, conforme o CEP.\n\nVocê vê o prazo exato antes de finalizar a compra.' },
  { question: 'Como faço uma troca?', answer: 'Solicite pela página de trocas em até 30 dias após o recebimento.' },
  { question: 'Quais formas de pagamento?', answer: 'Cartão em até 6x sem juros, Pix e boleto.' },
];

const meta = { title: 'Sections/Conteudo/FAQ', component: Faq, args: { items } } satisfies Meta<typeof Faq>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const TituloCustom: Story = { args: { title: 'Dúvidas sobre camisetas' } };
export const MuitosItens: Story = {
  args: { items: [...items, ...items.map((it, i) => ({ ...it, question: `${it.question} (${i + 4})` }))] },
};
