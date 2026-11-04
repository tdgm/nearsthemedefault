import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './tabs';

const tabs = [
  { id: 'a', label: 'Mulher', content: <p>Vitrine mulher</p> },
  { id: 'b', label: 'Homem', content: <p>Vitrine homem</p> },
  { id: 'c', label: 'Infantil', content: <p>Vitrine infantil</p> },
];

describe('Tabs', () => {
  it('expoe tablist nomeado e tabs', () => {
    render(<Tabs tabs={tabs} label="Vitrine" />);
    expect(screen.getByRole('tablist', { name: 'Vitrine' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('primeira aba ativa por padrao, com roving tabindex', () => {
    render(<Tabs tabs={tabs} label="Vitrine" />);
    const [a, b] = screen.getAllByRole('tab');
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(a).toHaveAttribute('tabindex', '0');
    expect(b).toHaveAttribute('tabindex', '-1');
  });

  it('paineis inativos ficam no HTML com hidden', () => {
    render(<Tabs tabs={tabs} label="Vitrine" />);
    expect(screen.getByText('Vitrine mulher')).toBeVisible();
    expect(screen.getByText('Vitrine homem', { selector: 'p' }).parentElement).toHaveAttribute('hidden');
  });

  it('clique troca a aba e chama onChange', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} label="Vitrine" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Homem' }));
    expect(screen.getByRole('tab', { name: 'Homem' })).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('setas movem com wrap; Home/End vao as pontas', () => {
    render(<Tabs tabs={tabs} label="Vitrine" />);
    const [a, b, c] = screen.getAllByRole('tab') as HTMLElement[];
    fireEvent.keyDown(a!, { key: 'ArrowRight' });
    expect(b).toHaveAttribute('aria-selected', 'true');
    expect(b).toHaveFocus();
    fireEvent.keyDown(b!, { key: 'End' });
    expect(c).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(c!, { key: 'ArrowRight' });
    expect(a).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(a!, { key: 'ArrowLeft' });
    expect(c).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(c!, { key: 'Home' });
    expect(a).toHaveAttribute('aria-selected', 'true');
  });

  it('aba tem alvo de toque de 44px', () => {
    render(<Tabs tabs={tabs} label="Vitrine" />);
    expect(screen.getAllByRole('tab')[0]).toHaveClass('min-h-11');
  });

  it('respeita defaultId', () => {
    render(<Tabs tabs={tabs} label="Vitrine" defaultId="c" />);
    expect(screen.getByRole('tab', { name: 'Infantil' })).toHaveAttribute('aria-selected', 'true');
  });
});
