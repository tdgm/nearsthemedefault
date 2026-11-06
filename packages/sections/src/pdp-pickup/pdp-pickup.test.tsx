import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdpPickup } from './pdp-pickup';
import { pdpPickupSchema } from './pdp-pickup.schema';

const pickupResult = {
  store: { id: 'loja-sp', name: 'Loja Paulista', address: 'Bela Vista, São Paulo - SP' },
  distanceKm: 0.6,
  pickup: { etaMinutes: 60 },
};

const deliveryResult = {
  store: { id: 'loja-bh', name: 'Loja Afonso Pena', address: 'Centro, Belo Horizonte - MG' },
  distanceKm: 3.2,
  delivery: { etaMinutes: 180 },
};

describe('PdpPickup', () => {
  it('sem cep: mostra dica para usar o campo de frete, nunca pede CEP de novo', () => {
    render(<PdpPickup />);
    expect(screen.getByText('Informe seu CEP no campo de frete acima para ver a loja mais próxima.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('com retirada: mostra loja, prazo e endereco', () => {
    render(<PdpPickup cep="01310100" quote={pickupResult} />);
    expect(screen.getByText('Retire na Loja Paulista em até 60 min')).toBeInTheDocument();
    expect(screen.getByText('Bela Vista, São Paulo - SP · 0.6 km de distância', { exact: false })).toBeInTheDocument();
  });

  it('com entrega: mostra loja e prazo de entrega, nao de retirada', () => {
    render(<PdpPickup cep="30130000" quote={deliveryResult} />);
    expect(screen.getByText('Entrega pela Loja Afonso Pena em até 180 min')).toBeInTheDocument();
    expect(screen.queryByText(/Retire na/)).toBeNull();
  });

  it('sem opcao: mostra erro, nunca a lista de resultado', () => {
    render(<PdpPickup cep="99999999" quote={{ error: 'Não há retirada nem entrega por loja disponível para este CEP.' }} />);
    expect(screen.getByText('Não há retirada nem entrega por loja disponível para este CEP.')).toBeInTheDocument();
  });

  it('reserva altura minima para o resultado (role=status)', () => {
    render(<PdpPickup />);
    expect(screen.getByRole('status')).toHaveClass('min-h-16');
  });

  it('schema: quote aceita resultado (retirada e/ou entrega) OU erro', () => {
    expect(pdpPickupSchema.safeParse({ quote: pickupResult }).success).toBe(true);
    expect(pdpPickupSchema.safeParse({ quote: deliveryResult }).success).toBe(true);
    expect(pdpPickupSchema.safeParse({ quote: { error: 'x' } }).success).toBe(true);
    expect(pdpPickupSchema.safeParse({ quote: { store: pickupResult.store, distanceKm: 1 } }).success).toBe(true);
  });
});
