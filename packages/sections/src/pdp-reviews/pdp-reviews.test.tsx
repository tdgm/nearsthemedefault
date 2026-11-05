import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpReviews } from './pdp-reviews';
import { pdpReviewsSchema } from './pdp-reviews.schema';

const items = [
  { author: 'Ana', rating: 5, date: '2026-03-10T12:00:00-03:00', title: 'Recomendo', body: 'Chegou no prazo.' },
  { author: 'Bia', rating: 4, date: '2026-04-02T09:30:00-03:00', body: 'Bom.' },
];

describe('PdpReviews', () => {
  it('agregado com texto alternativo, h2 e h3 so quando ha titulo', () => {
    render(<PdpReviews provider="nears" aggregate={{ rating: 4.5, count: 128 }} items={items} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Avaliações de clientes' })).toBeInTheDocument();
    expect(screen.getByText(/Avaliação 4,5 de 5, 128 avaliações/)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  });

  it('cada avaliacao tem nota em texto, autor e data em <time> dd/mm/aaaa', () => {
    const { container } = render(<PdpReviews provider="nears" aggregate={{ rating: 4.5, count: 2 }} items={items} />);
    expect(screen.getByText(/Avaliação 5 de 5/)).toBeInTheDocument();
    const time = container.querySelector('time')!;
    expect(time).toHaveAttribute('datetime', '2026-03-10T12:00:00-03:00');
    expect(time).toHaveTextContent('10/03/2026');
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });

  it('sem avaliacoes: mantem #avaliacoes e explica o vazio', () => {
    const { container } = render(<PdpReviews provider="nears" />);
    expect(container.querySelector('#avaliacoes')).not.toBeNull();
    expect(screen.getByText('Este produto ainda não tem avaliações.')).toBeInTheDocument();
  });

  it('mostra quantas avaliacoes aparecem e a fonte', () => {
    render(<PdpReviews provider="Painel Nears" aggregate={{ rating: 4.5, count: 128 }} items={items} />);
    expect(screen.getByText(/Mostrando 2 de 128 avaliações\. Fonte: Painel Nears/)).toBeInTheDocument();
  });

  it('schema: nota de 1 a 5 inteira', () => {
    expect(pdpReviewsSchema.safeParse({ provider: 'x', items: [{ ...items[0], rating: 6 }] }).success).toBe(false);
    expect(pdpReviewsSchema.safeParse({ provider: 'x', items }).success).toBe(true);
  });
});
