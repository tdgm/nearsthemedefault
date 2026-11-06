// Favoritos/wishlist mock (Fase 9c, ADR 0027). Espelha
// `contracts.yaml > data.favorite`. So guarda o `sku` + quando foi
// favoritado - nome/preco/imagem vem sempre do produto atual
// (`apps/web/lib/data/client.ts > getProducts`), nunca duplicado aqui.
// Somente leitura nesta sub-fase (ADR 0027, nota de implementacao da 9c): sem
// endpoint de favoritar/desfavoritar, no mesmo espirito de
// `/api/cart/items` (nenhuma mutacao mock deste repo persiste estado real).
import { z } from 'zod';

export const favoriteSchema = z.strictObject({
  sku: z.string().min(1),
  addedAt: z.iso.datetime({ offset: true }),
});
export type Favorite = z.infer<typeof favoriteSchema>;

type CustomerFavorite = { customerId: string; favorite: Favorite };

/**
 * Ana (`cliente-exemplo-1`) com favoritos; Bruno (`cliente-exemplo-2`) sem
 * nenhum, para exercitar o estado vazio de `/account/favoritos` (mesmo padrao
 * de enderecos/pedidos).
 */
const FAVORITES: readonly CustomerFavorite[] = [
  { customerId: 'cliente-exemplo-1', favorite: favoriteSchema.parse({ sku: 'SKU-0004', addedAt: '2026-10-15T10:00:00-03:00' }) },
  { customerId: 'cliente-exemplo-1', favorite: favoriteSchema.parse({ sku: 'SKU-0011', addedAt: '2026-10-28T19:45:00-03:00' }) },
  { customerId: 'cliente-exemplo-1', favorite: favoriteSchema.parse({ sku: 'SKU-0019', addedAt: '2026-11-01T08:30:00-03:00' }) },
];

/** Favoritos do cliente, do mais recente para o mais antigo. */
export async function findFavoritesByCustomerId(customerId: string): Promise<Favorite[]> {
  return FAVORITES.filter((f) => f.customerId === customerId)
    .map((f) => f.favorite)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}
