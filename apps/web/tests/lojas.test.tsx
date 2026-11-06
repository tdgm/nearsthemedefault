import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LojasPage } from '../lib/templates/lojas';
import { listStores } from '../lib/data/stores';

describe('/lojas (Fase 9d, ADR 0028: pagina publica de fulfillment por loja)', () => {
  it('um unico H1 e um landmark main', async () => {
    render(await LojasPage());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nossas lojas');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('um <address> por loja do fixture, com CEP formatado', async () => {
    const stores = await listStores();
    const { container } = render(await LojasPage());
    expect(container.querySelectorAll('address')).toHaveLength(stores.length);
    expect(screen.getAllByText(/CEP 01310-200/).length).toBeGreaterThan(0);
  });

  it('cada loja tem nome, endereco e um link "Ver no mapa" para o Google Maps', async () => {
    const stores = await listStores();
    render(await LojasPage());
    for (const store of stores) {
      expect(screen.getByRole('heading', { level: 2, name: store.name })).toBeInTheDocument();
    }
    const mapLinks = screen.getAllByRole('link', { name: 'Ver no mapa' });
    expect(mapLinks).toHaveLength(stores.length);
    expect(mapLinks[0]).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(mapLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('loja sem retirada (pickupEnabled: false) informa isso no texto', async () => {
    render(await LojasPage());
    expect(screen.getByText(/Sem retirada nesta loja/)).toBeInTheDocument();
  });

  it('JSON-LD inclui um LocalBusiness por loja', async () => {
    const stores = await listStores();
    const { container } = render(await LojasPage());
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent ?? '{}');
    const localBusinesses = (data['@graph'] as { '@type': string }[]).filter((n) => n['@type'] === 'LocalBusiness');
    expect(localBusinesses).toHaveLength(stores.length);
  });
});
