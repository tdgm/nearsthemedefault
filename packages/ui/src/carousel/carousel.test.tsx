import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    expect(screen.getAllByRole('list')[0]).toHaveClass('snap-x', 'snap-mandatory');
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
