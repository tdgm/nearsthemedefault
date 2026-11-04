import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from './tabs';

const items = [
  { id: 'a', label: 'Aba A', content: 'Conteúdo A' },
  { id: 'b', label: 'Aba B', content: 'Conteúdo B' },
  { id: 'c', label: 'Aba C', content: 'Conteúdo C' },
];

describe('Tabs', () => {
  it('mostra so o painel da aba ativa', () => {
    render(<Tabs label="Exemplo" items={items} />);
    expect(screen.getByText('Conteúdo A')).toBeVisible();
    expect(screen.getByText('Conteúdo B')).not.toBeVisible();
  });

  it('clicar na aba troca o painel visivel', () => {
    render(<Tabs label="Exemplo" items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Aba B' }));
    expect(screen.getByText('Conteúdo B')).toBeVisible();
    expect(screen.getByText('Conteúdo A')).not.toBeVisible();
  });

  it('seta para a direita move foco e selecao para a proxima aba', () => {
    render(<Tabs label="Exemplo" items={items} />);
    const tabA = screen.getByRole('tab', { name: 'Aba A' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Aba B' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Aba B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('seta para a direita na ultima aba volta para a primeira (wrap)', () => {
    render(<Tabs label="Exemplo" items={items} />);
    const tabC = screen.getByRole('tab', { name: 'Aba C' });
    tabC.focus();
    fireEvent.keyDown(tabC, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Aba A' })).toHaveFocus();
  });

  it('so a aba ativa tem tabIndex 0 (roving tabindex)', () => {
    render(<Tabs label="Exemplo" items={items} />);
    expect(screen.getByRole('tab', { name: 'Aba A' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('tab', { name: 'Aba B' })).toHaveAttribute('tabIndex', '-1');
  });
});
