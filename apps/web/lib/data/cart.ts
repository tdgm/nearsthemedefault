// Resolucao do carrinho contra o catalogo (Fase 10, ADR 0029). O cookie
// (`lib/cart/session.ts`) so guarda {sku, quantity}; nome/preco/imagem vem
// sempre daqui, na hora da leitura - nunca um snapshot de quando o item foi
// adicionado (CLAUDE.md > Seguranca: nunca estado de compra real guardado).
import type { CartItem } from '../cart/session';
import type { Product } from './schemas';

export type CartLine = {
  sku: string;
  quantity: number;
  product: Product;
  lineTotal: number;
};

export type CartSummary = {
  lines: CartLine[];
  count: number;
  subtotal: number;
};

/**
 * Junta `{sku, quantity}` do cookie com o catalogo (`getProducts()`). SKU que
 * nao existe mais no catalogo (produto descontinuado, ou cookie antigo de um
 * preset diferente) e descartado silenciosamente - nunca quebra a pagina.
 */
export function resolveCartLines(items: readonly CartItem[], products: readonly Product[]): CartLine[] {
  const bySku = new Map(products.filter((p) => p.sku).map((p) => [p.sku as string, p]));
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = bySku.get(item.sku);
    if (!product) continue;
    lines.push({ sku: item.sku, quantity: item.quantity, product, lineTotal: product.price * item.quantity });
  }
  return lines;
}

/** Contagem total de itens e subtotal (soma de `lineTotal`) do carrinho. */
export function cartSummary(lines: readonly CartLine[]): CartSummary {
  return {
    lines: [...lines],
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + l.lineTotal, 0),
  };
}
