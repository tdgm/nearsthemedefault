// Carrinho MOCK (Fase 10, ADR 0029): cookie cujo valor e so uma lista de
// {sku, quantity} - nunca preco, nome, imagem ou qualquer dado de pagamento
// (CLAUDE.md > Seguranca: este repo e frontend puro, nunca guarda estado de
// compra real). Preco/nome/imagem sao sempre resolvidos contra o catalogo em
// `apps/web/lib/data/cart.ts`, nunca guardados aqui.
// Helpers em texto puro (string <-> string), sem depender de `next/headers`,
// para serem testaveis sem mockar Request/Response - mesmo padrao de
// `apps/web/lib/auth/session.ts` (ADR 0027). Nao reusa `cookieAttrs` de la
// (funcao privada, nao exportada): duplica as poucas linhas de atributos em
// vez de criar um util compartilhado so pra isso.
import { z } from 'zod';

export const CART_COOKIE = 'nears_cart';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
/** Teto de linhas e de quantidade por linha: limite do tamanho do cookie
 * (~4KB no navegador) e mesmo teto de quantidade de `/api/cart/items`. */
const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

const cartItemSchema = z.strictObject({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});

const cartItemsSchema = z.array(cartItemSchema).max(MAX_ITEMS);

export type CartItem = z.infer<typeof cartItemSchema>;

/**
 * `Secure` exige HTTPS: em `pnpm dev` (http://localhost) o navegador
 * descartaria o cookie. Mesmo padrao de `auth/session.ts`.
 */
function cookieAttrs(maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

/** Header `Set-Cookie` com os itens atuais do carrinho. */
export function cartCookieHeader(items: readonly CartItem[]): string {
  const capped = cartItemsSchema.parse(items.slice(0, MAX_ITEMS));
  return `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(capped))}; ${cookieAttrs(THIRTY_DAYS_SECONDS)}`;
}

/** Header `Set-Cookie` que esvazia o carrinho. */
export function clearCartCookieHeader(): string {
  return `${CART_COOKIE}=; ${cookieAttrs(0)}`;
}

/**
 * Decodifica o VALOR ja extraido do cookie `nears_cart`. Cookie ausente,
 * corrompido, com formato invalido, SKU vazio ou quantidade fora do
 * intervalo: nunca lanca erro, devolve carrinho vazio - um cookie quebrado
 * nunca pode derrubar a pagina. Linhas que excedem `MAX_ITEMS` sao
 * descartadas (nunca truncadas silenciosamente de forma inconsistente: ou o
 * JSON todo e valido, ou volta vazio).
 */
export function decodeCartItems(value: string | undefined | null): CartItem[] {
  if (!value) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(decodeURIComponent(value));
  } catch {
    return [];
  }
  const parsed = cartItemsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

/** Itens do carrinho a partir do header `Cookie` cru de uma requisicao (API routes). */
export function readCartItems(cookieHeader: string | null | undefined): CartItem[] {
  if (!cookieHeader) return [];
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    if (name !== CART_COOKIE) continue;
    return decodeCartItems(part.slice(separator + 1).trim());
  }
  return [];
}

/** Soma `quantity` a uma linha existente (mesmo sku) ou cria uma nova; sempre capado. */
export function mergeCartItem(items: readonly CartItem[], sku: string, quantity: number): CartItem[] {
  const next = items.some((i) => i.sku === sku)
    ? items.map((i) => (i.sku === sku ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) } : i))
    : [...items, { sku, quantity: Math.min(MAX_QUANTITY, quantity) }];
  return next.slice(0, MAX_ITEMS);
}

/** Define a quantidade absoluta de uma linha; `quantity <= 0` remove a linha. */
export function setCartItemQuantity(items: readonly CartItem[], sku: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.sku !== sku);
  const capped = Math.min(MAX_QUANTITY, quantity);
  return items.some((i) => i.sku === sku) ? items.map((i) => (i.sku === sku ? { ...i, quantity: capped } : i)) : [...items, { sku, quantity: capped }];
}
