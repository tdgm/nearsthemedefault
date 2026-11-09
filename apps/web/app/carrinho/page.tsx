import { CartPage, cartMetadata } from '../../lib/templates/cart';

export const generateMetadata = cartMetadata;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Carrinho de pagina propria (Fase 10, ADR 0029).
export default function Page({ searchParams }: Props) {
  return <CartPage searchParams={searchParams} />;
}
