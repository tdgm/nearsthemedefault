import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from './accordion';

const items = [
  { id: 'a', title: 'Composição', content: <p>100% algodão</p>, defaultOpen: true },
  { id: 'b', title: 'Cuidados', content: <p>Lavar a 30 °C</p> },
];

describe('Accordion', () => {
  it('usa details/summary nativos', () => {
    const { container } = render(<Accordion items={items} />);
    expect(container.querySelectorAll('details')).toHaveLength(2);
    expect(container.querySelectorAll('summary')).toHaveLength(2);
  });

  it('mantem todo o conteudo no HTML (indexavel), mesmo fechado', () => {
    render(<Accordion items={items} />);
    expect(screen.getByText('Lavar a 30 °C')).toBeInTheDocument();
  });

  it('respeita defaultOpen', () => {
    const { container } = render(<Accordion items={items} />);
    const [a, b] = Array.from(container.querySelectorAll('details'));
    expect(a).toHaveAttribute('open');
    expect(b).not.toHaveAttribute('open');
  });

  it('titulos sao headings no nivel pedido', () => {
    render(<Accordion items={items} headingLevel={2} />);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
  });

  it('name agrupa itens como exclusivos', () => {
    const { container } = render(<Accordion items={items} name="pdp" />);
    container.querySelectorAll('details').forEach((d) => expect(d).toHaveAttribute('name', 'pdp'));
  });
});
