import { Link } from '@nears/ui';
import { vocab } from '../manifest';
import { buildMetadata } from '../seo';

export const CHECKOUT_PATH = '/checkout';

export async function checkoutMetadata() {
  return buildMetadata({ template: 'checkout', title: vocab('checkoutStubTitle'), description: vocab('checkoutStubMessage'), path: CHECKOUT_PATH });
}

/**
 * Stub de checkout (Fase 10, ADR 0029): "checkout" ja estava reservado desde
 * a Fase 9a e o CTA "Finalizar compra" do minicart/carrinho sempre apontou
 * pra `/checkout` (default de `checkoutHref`) sem a rota existir - era um
 * link morto. So avisa que o checkout de verdade e responsabilidade do
 * backend/painel (CLAUDE.md > Seguranca): nenhum dado dinamico, nenhum fluxo
 * de pagamento simulado - render: ssg sem Suspense, mesmo padrao de
 * institutional/lojas.
 */
export function CheckoutStubPage() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="my-4 text-2xl font-heading">{vocab('checkoutStubTitle')}</h1>
      <p className="mb-6 text-on-surface-muted">{vocab('checkoutStubMessage')}</p>
      <Link href="/carrinho" appearance={{ variant: 'primary' }}>
        {vocab('checkoutStubBack')}
      </Link>
    </main>
  );
}
