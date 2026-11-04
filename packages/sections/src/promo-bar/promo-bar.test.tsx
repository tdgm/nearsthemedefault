import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatRemaining } from './promo-bar-client';
import { PromoBar } from './promo-bar';
import { promoBarSchema } from './promo-bar.schema';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-04T12:00:00-03:00'));
});
afterEach(() => vi.useRealTimers());

describe('formatRemaining', () => {
  it('formata HH:MM:SS', () => expect(formatRemaining(3_661_000)).toBe('01:01:01'));
  it('inclui dias quando ha mais de 24h', () => expect(formatRemaining(90_061_000)).toBe('1d 01:01:01'));
  it('devolve null quando acabou', () => {
    expect(formatRemaining(0)).toBeNull();
    expect(formatRemaining(-5)).toBeNull();
  });
});

describe('PromoBar', () => {
  it('e uma regiao nomeada com a mensagem e altura reservada de 48px', () => {
    render(<PromoBar message="Frete grátis" />);
    const region = screen.getByRole('region', { name: 'Promoção' });
    expect(region).toHaveClass('h-12');
    expect(region).toHaveTextContent('Frete grátis');
  });

  it('mensagem vira link quando ha href', () => {
    render(<PromoBar message="Ofertas" href="/ofertas" />);
    expect(screen.getByRole('link', { name: 'Ofertas' })).toHaveAttribute('href', '/ofertas');
  });

  it('dispensavel por padrao: botao de 44px remove a barra', () => {
    render(<PromoBar message="Ofertas" />);
    const dismiss = screen.getByRole('button', { name: 'Dispensar aviso' });
    expect(dismiss).toHaveClass('size-11');
    fireEvent.click(dismiss);
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('dismissible=false nao mostra o botao', () => {
    render(<PromoBar message="Ofertas" dismissible={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('countdown: HTML inicial traz a data em texto; depois do mount mostra o tempo restante e anda', () => {
    render(<PromoBar message="Ofertas" countdown={{ endsAt: '2026-11-04T15:00:00-03:00' }} />);
    expect(screen.getByText('Termina em 04/11/2026')).toHaveClass('sr-only');
    expect(screen.getByText('03:00:00')).toHaveAttribute('aria-hidden', 'true');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('02:59:59')).toBeInTheDocument();
  });

  it('countdown expirado volta ao texto estatico', () => {
    render(<PromoBar message="Ofertas" countdown={{ endsAt: '2020-01-01T00:00:00-03:00' }} />);
    expect(screen.getAllByText('Termina em 01/01/2020').length).toBeGreaterThan(0);
  });

  it('link de regras tem alvo de 44px', () => {
    render(<PromoBar message="Ofertas" rulesHref="/regras" />);
    expect(screen.getByRole('link', { name: 'Ver regras' })).toHaveClass('min-h-11');
  });

  it('labels sobrescrevem a microcopy', () => {
    render(<PromoBar message="x" labels={{ region: 'Campanha', dismiss: 'Fechar aviso' }} />);
    expect(screen.getByRole('region', { name: 'Campanha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar aviso' })).toBeInTheDocument();
  });
});

describe('promoBarSchema', () => {
  it('aceita props validas', () => {
    expect(promoBarSchema.safeParse({ message: 'x', countdown: { endsAt: '2026-12-01T00:00:00-03:00' } }).success).toBe(true);
  });
  it('rejeita mensagem vazia, data invalida e campo desconhecido', () => {
    expect(promoBarSchema.safeParse({ message: '' }).success).toBe(false);
    expect(promoBarSchema.safeParse({ message: 'x', countdown: { endsAt: 'amanha' } }).success).toBe(false);
    expect(promoBarSchema.safeParse({ message: 'x', cor: 'red' }).success).toBe(false);
  });
});
