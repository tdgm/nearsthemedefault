import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionItem } from './accordion';

describe('Accordion', () => {
  it('defaultOpen comeca aberto', () => {
    render(
      <Accordion>
        <AccordionItem title="Composição" defaultOpen>
          Conteúdo
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Composição').closest('details')).toHaveAttribute('open');
  });

  it('clicar no titulo abre/fecha (nativo de <details>/<summary>)', () => {
    render(
      <Accordion>
        <AccordionItem title="Como lavar">Instruções de lavagem</AccordionItem>
      </Accordion>,
    );
    const details = screen.getByText('Como lavar').closest('details')!;
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Como lavar'));
    expect(details).toHaveAttribute('open');
  });
});
