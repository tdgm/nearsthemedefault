import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Faq } from './faq';
import { faqSchema } from './faq.schema';

const items = [
  { question: 'Prazo?', answer: 'De 3 a 7 dias.\n\nVeja no checkout.' },
  { question: 'Troca?', answer: '30 dias.' },
  { question: 'Pagamento?', answer: 'Cartao, Pix e boleto.' },
];

describe('Faq', () => {
  it('h2 da secao e h3 por pergunta, sem pular nivel', () => {
    render(<Faq items={items} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Perguntas frequentes' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('todas as respostas estao no DOM (details fechados) em paragrafos', () => {
    const { container } = render(<Faq items={items} />);
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(3);
    details.forEach((d) => expect(d).not.toHaveAttribute('open'));
    expect(screen.getByText('De 3 a 7 dias.').tagName).toBe('P');
    expect(screen.getByText('Veja no checkout.')).toBeInTheDocument();
  });

  it('titulo customizado', () => {
    render(<Faq items={items} title="Duvidas" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Duvidas' })).toBeInTheDocument();
  });

  it('schema exige no minimo 3 itens', () => {
    expect(faqSchema.safeParse({ items: items.slice(0, 2) }).success).toBe(false);
    expect(faqSchema.safeParse({ items }).success).toBe(true);
  });
});
