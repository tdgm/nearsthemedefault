import { describe, expect, it } from 'vitest';
import { findOrderByIdForCustomer, findOrdersByCustomerId } from '../lib/data/orders';
import { findFavoritesByCustomerId } from '../lib/data/favorites';

describe('findOrdersByCustomerId', () => {
  it('Ana (cliente-exemplo-1) tem pedidos, do mais recente para o mais antigo', async () => {
    const orders = await findOrdersByCustomerId('cliente-exemplo-1');
    expect(orders.length).toBeGreaterThan(0);
    const placedAtTimestamps = orders.map((o) => new Date(o.placedAt).getTime());
    expect(placedAtTimestamps).toEqual([...placedAtTimestamps].sort((a, b) => b - a));
  });

  it('Bruno (cliente-exemplo-2) nao tem nenhum pedido (estado vazio)', async () => {
    expect(await findOrdersByCustomerId('cliente-exemplo-2')).toEqual([]);
  });

  it('cliente desconhecido: lista vazia, nunca erro', async () => {
    expect(await findOrdersByCustomerId('nao-existe')).toEqual([]);
  });
});

describe('findOrderByIdForCustomer (isolamento entre clientes)', () => {
  it('retorna o pedido quando pertence ao cliente', async () => {
    const order = await findOrderByIdForCustomer('pedido-1001', 'cliente-exemplo-1');
    expect(order?.id).toBe('pedido-1001');
  });

  it('nunca retorna o pedido de outro cliente, mesmo com o id certo (evita IDOR)', async () => {
    expect(await findOrderByIdForCustomer('pedido-1001', 'cliente-exemplo-2')).toBeNull();
  });

  it('pedido inexistente: null', async () => {
    expect(await findOrderByIdForCustomer('pedido-9999', 'cliente-exemplo-1')).toBeNull();
  });
});

describe('findFavoritesByCustomerId', () => {
  it('Ana (cliente-exemplo-1) tem favoritos, do mais recente para o mais antigo', async () => {
    const favorites = await findFavoritesByCustomerId('cliente-exemplo-1');
    expect(favorites.length).toBeGreaterThan(0);
    const addedAtTimestamps = favorites.map((f) => new Date(f.addedAt).getTime());
    expect(addedAtTimestamps).toEqual([...addedAtTimestamps].sort((a, b) => b - a));
  });

  it('Bruno (cliente-exemplo-2) nao tem nenhum favorito (estado vazio)', async () => {
    expect(await findFavoritesByCustomerId('cliente-exemplo-2')).toEqual([]);
  });
});
