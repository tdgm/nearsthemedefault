import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from './carousel';

const slides = [<p key="1">Um</p>, <p key="2">Dois</p>, <p key="3">Três</p>];
const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
});

describe('Carousel', () => {
  it('e uma regiao nomeada com roledescription', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    const region = screen.getByRole('region', { name: 'Destaques' });
    expect(region).toHaveAttribute('aria-roledescription', 'carrossel');
  });

  it('cada slide e um grupo "n de total"', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    expect(screen.getByRole('group', { name: '2 de 3' })).toBeInTheDocument();
  });

  it('todo o conteudo esta no HTML', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    ['Um', 'Dois', 'Três'].forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
  });

  it('usa scroll-snap nativo', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    expect(screen.getByRole('region', { name: 'Destaques' }).firstElementChild).toHaveClass('snap-x', 'snap-mandatory');
  });

  it('anterior comeca desabilitado; proximo chama scrollIntoView', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    expect(screen.getByRole('button', { name: 'Slide anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    expect(screen.getByRole('button', { name: 'Slide anterior' })).toBeEnabled();
  });

  it('proximo desabilita no ultimo slide', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    const next = screen.getByRole('button', { name: 'Próximo slide' });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(next).toBeDisabled();
  });

  it('prefers-reduced-motion rola sem animacao', () => {
    window.matchMedia = ((q: string) => ({ matches: true, media: q })) as unknown as typeof window.matchMedia;
    render(<Carousel slides={slides} label="Destaques" />);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('botoes tem alvo de 44px; com um slide nao ha botoes', () => {
    const { rerender } = render(<Carousel slides={slides} label="Destaques" />);
    expect(screen.getByRole('button', { name: 'Próximo slide' })).toHaveClass('size-11');
    rerender(<Carousel slides={[slides[0]]} label="Destaques" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Carousel com autoplay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sem autoplayMs nao ha botao de pausa nem avanco sozinho', () => {
    render(<Carousel slides={slides} label="Destaques" />);
    expect(screen.queryByRole('button', { name: /Pausar|Retomar/ })).toBeNull();
    act(() => void vi.advanceTimersByTime(10000));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('avanca a cada intervalo e volta ao primeiro no fim', () => {
    render(<Carousel slides={slides} label="Destaques" autoplayMs={3000} />);
    act(() => void vi.advanceTimersByTime(3000));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    act(() => void vi.advanceTimersByTime(3000));
    act(() => void vi.advanceTimersByTime(3000));
    expect(scrollIntoView).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'Slide anterior' })).toBeDisabled();
  });

  it('botao de pausa para e retoma (aria-pressed)', () => {
    render(<Carousel slides={slides} label="Destaques" autoplayMs={3000} />);
    const pause = screen.getByRole('button', { name: 'Pausar rotação' });
    expect(pause).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: 'Retomar rotação' })).toHaveAttribute('aria-pressed', 'true');
    act(() => void vi.advanceTimersByTime(10000));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('pausa enquanto o foco esta dentro do carrossel', () => {
    render(<Carousel slides={slides} label="Destaques" autoplayMs={3000} />);
    fireEvent.focus(screen.getByRole('button', { name: 'Próximo slide' }));
    act(() => void vi.advanceTimersByTime(10000));
    expect(scrollIntoView).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByRole('button', { name: 'Próximo slide' }));
    act(() => void vi.advanceTimersByTime(3000));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('com prefers-reduced-motion nao inicia a rotacao', () => {
    window.matchMedia = ((q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    render(<Carousel slides={slides} label="Destaques" autoplayMs={3000} />);
    expect(screen.getByRole('button', { name: 'Retomar rotação' })).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(10000));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('aria-live fica off enquanto gira e polite quando pausado', () => {
    const { container } = render(<Carousel slides={slides} label="Destaques" autoplayMs={3000} />);
    const track = container.querySelector('[aria-live]')!;
    expect(track).toHaveAttribute('aria-live', 'off');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar rotação' }));
    expect(track).toHaveAttribute('aria-live', 'polite');
  });
});
